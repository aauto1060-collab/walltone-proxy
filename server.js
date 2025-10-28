import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/api/*", async (req, res) => {
  try {
    // الرابط الأصلي في InfinityFree
    const originalUrl = "https://walltone.ct.ws/" + req.path;
    const fullUrl = originalUrl + (req.url.includes("?") ? "&" : "?") + req.url.split("?")[1] || "";

    // اجلب البيانات من السيرفر الأصلي
    const response = await fetch(fullUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(10000, () => console.log("Proxy running on port 10000"));
