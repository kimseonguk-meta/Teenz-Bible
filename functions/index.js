const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.database();

/**
 * Triggered when a new report is created in the Realtime Database.
 * Sends a push notification to the admin and checks for repeated reports.
 */
exports.onNewReport = functions.database
  .ref("/reports/{reportId}")
  .onCreate(async (snapshot, context) => {
    const report = snapshot.val();
    const reportId = context.params.reportId;

    console.log("New report received:", reportId, report);

    // 1. Send push notification to admin
    try {
      await sendAdminNotification(report, reportId);
    } catch (err) {
      console.error("Failed to send notification:", err);
    }

    // 2. Check for repeated reports (auto-flag)
    try {
      await checkAndAutoFlag(report);
    } catch (err) {
      console.error("Failed to check auto-flag:", err);
    }

    return null;
  });

/**
 * Send push notification to admin device(s)
 */
async function sendAdminNotification(report, reportId) {
  // Get admin FCM tokens from database
  const tokensSnapshot = await db.ref("/adminTokens").once("value");
  const tokensData = tokensSnapshot.val();

  if (!tokensData) {
    console.log("No admin tokens registered. Skipping push notification.");
    // Still save to notification log for in-app display
    await db.ref("/notifications").push({
      type: "new_report",
      reportId: reportId,
      title: `🚨 New Report: ${report.book} Ch.${report.chapter}`,
      body: `Reason: ${report.reason}${report.detail ? " - " + report.detail.substring(0, 50) : ""}`,
      date: new Date().toISOString(),
      read: false,
    });
    return;
  }

  const tokens = Object.values(tokensData).map((t) => t.token).filter(Boolean);

  if (tokens.length === 0) {
    console.log("No valid tokens found.");
    return;
  }

  const message = {
    notification: {
      title: `🚨 New Report: ${report.book} Ch.${report.chapter}`,
      body: `Reason: ${report.reason}${report.detail ? "\n" + report.detail.substring(0, 100) : ""}`,
    },
    data: {
      reportId: reportId,
      book: report.book || "",
      chapter: String(report.chapter || ""),
      reason: report.reason || "",
      click_action: "OPEN_ADMIN",
    },
  };

  // Send to all admin devices
  const results = await Promise.allSettled(
    tokens.map((token) =>
      admin.messaging().send({ ...message, token })
    )
  );

  // Clean up invalid tokens
  const invalidTokens = [];
  results.forEach((result, idx) => {
    if (result.status === "rejected") {
      const error = result.reason;
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(tokens[idx]);
      }
    }
  });

  if (invalidTokens.length > 0) {
    const snapshot = await db.ref("/adminTokens").once("value");
    const data = snapshot.val() || {};
    for (const [key, val] of Object.entries(data)) {
      if (invalidTokens.includes(val.token)) {
        await db.ref(`/adminTokens/${key}`).remove();
        console.log("Removed invalid token:", key);
      }
    }
  }

  // Save notification for in-app display
  await db.ref("/notifications").push({
    type: "new_report",
    reportId: reportId,
    title: `🚨 New Report: ${report.book} Ch.${report.chapter}`,
    body: `Reason: ${report.reason}${report.detail ? " - " + report.detail.substring(0, 50) : ""}`,
    date: new Date().toISOString(),
    read: false,
  });

  console.log(
    `Notification sent to ${tokens.length} devices. ${invalidTokens.length} invalid tokens removed.`
  );
}

/**
 * Check if a chapter has been reported 3+ times and auto-flag it
 */
async function checkAndAutoFlag(report) {
  const { book, chapter } = report;
  const flagKey = `${book}_${chapter}`;

  // Count reports for this chapter
  const reportsSnapshot = await db.ref("/reports").once("value");
  const allReports = reportsSnapshot.val() || {};

  let count = 0;
  for (const r of Object.values(allReports)) {
    if (r.book === book && r.chapter === chapter && r.status !== "resolved") {
      count++;
    }
  }

  console.log(`Report count for ${flagKey}: ${count}`);

  // Auto-flag if 3+ unresolved reports
  if (count >= 3) {
    const flagData = {
      book,
      chapter,
      reportCount: count,
      flaggedAt: new Date().toISOString(),
      status: "flagged",
      autoFlagged: true,
    };

    await db.ref(`/flaggedChapters/${flagKey}`).set(flagData);
    console.log(`Auto-flagged: ${flagKey} with ${count} reports`);

    // Also send a priority notification
    await db.ref("/notifications").push({
      type: "auto_flag",
      title: `⚠️ Auto-Flagged: ${book} Ch.${chapter}`,
      body: `${count} reports received. Requires immediate attention.`,
      date: new Date().toISOString(),
      read: false,
      priority: "high",
    });
  }
}

/**
 * Bible AI - Gemini API proxy for native and web clients
 * This avoids rate limiting issues by routing through server with retry logic
 */
exports.bibleAI = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { messages, systemPrompt } = req.body;
  if (!messages || !systemPrompt) {
    res.status(400).json({ error: "Missing messages or systemPrompt" });
    return;
  }

  const GEMINI_KEY = functions.config().gemini?.key || "AIzaSyBj4z0lM-Jbwxc40pvqWpNIJii7S1p_zUE";
  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"];
  const fetch = require("node-fetch");

  for (const model of models) {
    try {
      const isThinkingModel = model.includes("2.5") && !model.includes("lite");
      const reqBody = JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          ...(isThinkingModel ? { thinkingConfig: { thinkingBudget: 1024 } } : {}),
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: reqBody }
      );
      const data = await response.json();

      if (data.error) {
        console.warn(`Gemini ${model} error:`, data.error.code, data.error.message?.slice(0, 80));
        if (data.error.code === 429) {
          await new Promise((r) => setTimeout(r, 1000));
        }
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        res.json({ data: { candidates: [{ content: { parts: [{ text }] } }] } });
        return;
      }
      continue;
    } catch (e) {
      console.warn(`Gemini ${model} fetch error:`, e.message);
    }
  }

  res.status(503).json({ error: "All models unavailable. Please try again later." });
});

/**
 * HTTP function to get report statistics (for admin dashboard)
 */
exports.getReportStats = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const reportsSnap = await db.ref("/reports").once("value");
    const reports = reportsSnap.val() || {};
    const flaggedSnap = await db.ref("/flaggedChapters").once("value");
    const flagged = flaggedSnap.val() || {};

    const reportList = Object.entries(reports).map(([id, r]) => ({ id, ...r }));
    const stats = {
      total: reportList.length,
      pending: reportList.filter((r) => r.status === "pending").length,
      resolved: reportList.filter((r) => r.status === "resolved").length,
      flaggedChapters: Object.keys(flagged).length,
      byReason: {},
      byBook: {},
    };

    reportList.forEach((r) => {
      stats.byReason[r.reason] = (stats.byReason[r.reason] || 0) + 1;
      stats.byBook[r.book] = (stats.byBook[r.book] || 0) + 1;
    });

    res.json({ stats, flagged });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
