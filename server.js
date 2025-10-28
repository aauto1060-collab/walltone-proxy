import express from "express";
import fetch from "node-fetch";

const app = express();

// CORS عام (يسمح لتطبيقك بالاتصال)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// helper لبناء الرابط الأصلي بالضبط
function buildOriginalUrl(req) {
  // نأخذ الجزء بعد /api/
  let pathPart = req.originalUrl; // сохранить originalUrl (path + query)
  // لو المستخدم طلب مثل /api/get_app_details&lang=1  فـ originalUrl سيحتوي عليها بعد /api
  // نزيل بادئة /api
  if (pathPart.startsWith("/api")) pathPart = pathPart.replace("/api", "");
  // لو بدأ بـ '/' فنتأكد من إزالته لتكوين URL صحيح بعد اسم المضيف
  if (pathPart.startsWith("/")) pathPart = pathPart.substring(1);

  // بعض روابط التطبيق تستخدم & بدلاً من ? (كما عندك) — نرسلها كما هي
  const original = `https://walltone.ct.ws/${pathPart}`;
  return original;
}

async function tryFetchWithRetry(url, options = {}, attempts = 2) {
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const resp = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return resp;
    } catch (err) {
      // آخر محاولة ترمي الخطأ للخارج
      if (i === attempts - 1) throw err;
      // خلاف ذلك ننتظر شوية ونجرب تاني
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
}

app.get("/api/*", async (req, res) => {
  try {
    const originalUrl = buildOriginalUrl(req);

    // رؤوس نحاكي بها متصفح/تطبيق ليقلّ لو InfinityFree يحاول التمييز
    const headers = {
      "User-Agent": req.get("User-Agent") || "Mozilla/5.0 (Linux; Android 10)",
      "Accept": req.get("Accept") || "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": req.get("Accept-Language") || "en-US,en;q=0.5",
      "Referer": "https://walltone.ct.ws/",
      "Origin": "https://walltone.ct.ws"
    };

    console.log("Proxy -> fetch:", originalUrl);

    const response = await tryFetchWithRetry(originalUrl, { headers }, 2);

    // انسخ الرأس ونوع المحتوى كما هو
    const contentType = response.headers.get("content-type") || "text/plain";
    res.setHeader("Content-Type", contentType);

    const body = await response.text();
    res.status(response.status).send(body);
  } catch (error) {
    console.error("Proxy error:", error && error.message ? error.message : error);
    res.status(502).json({ error: String(error && error.message ? error.message : error) });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Walltone Proxy (Replit) running");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
