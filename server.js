import express from "express";
import fetch from "node-fetch";

const app = express();

// السماح لكل الطلبات (CORS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("✅ Walltone Proxy active and running!");
});

// أي رابط يبدأ بـ /api/
app.get("/api/*", async (req, res) => {
  try {
    let pathPart = req.originalUrl; // مثال: /api/get_app_details&lang=1
    if (pathPart.startsWith("/api/")) pathPart = pathPart.replace("/api/", "");
    const originalUrl = `https://walltone.ct.ws/${pathPart}`;

    console.log("🔁 Forwarding ->", originalUrl);

    const response = await fetch(originalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
        "Accept": "application/json,text/html,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://walltone.ct.ws/",
      },
    });

    const body = await response.text();
    res.status(response.status);
    res.set("Content-Type", response.headers.get("content-type") || "application/json");
    res.send(body);
  } catch (error) {
    console.error("❌ Proxy error:", error.message);
    res.status(502).json({ error: error.message });
  }
});

// تشغيل السيرفر
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Proxy running on port ${port}`));
