import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Parse JSON bodies
  app.use(express.json());

  // ─── Bible AI Proxy ─────────────────────────────────────────
  app.post("/api/bible-ai", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key not configured" });
      return;
    }
    try {
      const { messages, systemPrompt } = req.body;
      const models = ["gemini-2.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.0-flash"];
      let data: any = null;
      let lastError = "";
      for (const model of models) {
        try {
          // Use thinkingConfig for 2.5 thinking models (not lite) to limit thinking budget
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
          const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: reqBody }
          );
          data = await resp.json();
          if (data.error) {
            lastError = data.error.message;
            if (data.error.code === 429) await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          // Null-safe: thinking models can return content without parts
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) break;
          lastError = "No valid response";
        } catch (e: any) {
          lastError = e.message;
        }
      }
      res.json({ data, error: data?.candidates?.[0]?.content?.parts?.[0]?.text ? null : lastError });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ─── Manus Storage Proxy ─────────────────────────────────────
  app.get("/manus-storage/:key(*)", async (req, res) => {
    const key = req.params.key;
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
    const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
    if (!forgeBaseUrl || !forgeKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl.toString(), {
        headers: { Authorization: `Bearer ${forgeKey}` },
      });
      if (!forgeResp.ok) {
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL");
        return;
      }
      res.redirect(307, url);
    } catch {
      res.status(502).send("Storage proxy error");
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
