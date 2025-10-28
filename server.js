import express from "express";
import fetch from "node-fetch";

const app = express();

// تمكين الـ CORS في حال احتاجه تطبيقك
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/api/*", async (req, res) => {
  try {
    // إزالة "/api/" من بداية المسار
    const targetPath = req.path.replace("/api/", "");
    // بناء الرابط الأصلي الصحيح
    const originalUrl = `https://walltone.ct.ws/${targetPath}${req.url.includes("?") ? "?" + req.url.split("?")[1] : ""}`;

    console.log("Fetching:", originalUrl);

    const response = await fetch(originalUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const data = await response.text();

    // تمرير نفس الحالة
    res.status(response.status).send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send({ error: error.message });
  }
});

// صفحة افتراضية لتأكيد التشغيل
app.get("/", (req, res) => {
  res.send("✅ Walltone Proxy is running on Vercel");
});

app.listen(10000, () => console.log("Proxy running on port 10000"));
