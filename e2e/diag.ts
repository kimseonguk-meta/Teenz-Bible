import { auth, db } from "../client/src/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { ref, get } from "firebase/database";
const t = setTimeout(() => { console.log("TIMEOUT 60s"); process.exit(2); }, 60000);
console.log("signing in...");
signInAnonymously(auth).then(async (c) => {
  console.log("signed in", c.user.uid.slice(0,8));
  const v = await get(ref(db, "challenges/jezaban2026/aggregate/2026-09-15"));
  console.log("aggregate:", JSON.stringify(v.val()));
  clearTimeout(t); process.exit(0);
}).catch((e) => { console.log("ERR", e.message); clearTimeout(t); process.exit(1); });
