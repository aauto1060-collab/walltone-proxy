import express from "express";
import fetch from "node-fetch";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// يبني الرابط الأصلي بالضبط كما يرسله التطبيق
function buildOriginalUrl(req) {
  // سيصل مثل: /api/get_app_details&lang=1
  let pathPart = req.originalUrl;
  if (pathPart.startsWith("/")) pathPart = pathPart.substring(1);
  // النتيجة: api/get_app_details&lang=1
  return `https://walltone.ct.ws/${pathPart}`;
}

app.get("/*", async (req, res) => {
  try {
    const originalUrl = buildOriginalUrl(req);
    console.log("Proxy forwarding ->", originalUrl);

    const headers = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://walltone.ct.ws/",
      "Origin": "https://walltone.ct.ws"
    };

    const response = await fetch(originalUrl, { headers });
    const body = await response.text();

    res.status(response.status);
    res.set("Content-Type", response.headers.get("content-type") || "application/json");
    res.send(body);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(502).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Walltone Proxy active!");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
