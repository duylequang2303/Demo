const sharp = require("sharp");
const fetch = require("node-fetch"); // cần thêm cho netlify

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const w = params.w ? parseInt(params.w, 10) : null;
    const h = params.h ? parseInt(params.h, 10) : null;

    if (!w && !h) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Thiếu query parameter w hoặc h" })
      };
    }

    // Danh sách link ảnh (cú pháp chuẩn)
    const reiImages = [
      "https://i.pinimg.com/736x/f6/49/41/f649412a33b9260c2b558297c39d45ac.jpg",
      "https://i.pinimg.com/736x/ec/2a/22/ec2a221b0693b58fa20fca14bbac2358.jpg",
      "https://i.pinimg.com/736x/d8/d9/88/d8d98811a0a4565f4038c2fd711036c9.jpg",
      "https://i.pinimg.com/736x/19/a8/e1/19a8e1346a197b10baef13271d68ec4a.jpg",
      "https://i.pinimg.com/736x/b3/09/51/b309516c7e1287fee304c0021743ea48.jpg",
      "https://i.pinimg.com/1200x/d2/5e/5c/d25e5c56f02b05405d75bc0e4e9eafb8.jpg",
      "https://i.pinimg.com/736x/ad/82/78/ad82788e06adb0e591335ad650ec806d.jpg",
      "https://i.pinimg.com/736x/73/c2/ed/73c2ed6794df3178a049fcfbc4ab3689.jpg",
      "https://i.pinimg.com/736x/36/60/c3/3660c3f9ee36da8bc1e18200412b07d6.jpg"
    ];

    // random 1 ảnh
    const imageUrl = reiImages[Math.floor(Math.random() * reiImages.length)];

    // fetch ảnh
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const inputBuffer = Buffer.from(await response.arrayBuffer());

    // resize (giữ tỷ lệ, fit inside để không bị crop)
    let pipeline = sharp(inputBuffer).resize(w || null, h || null, { fit: "inside" });

    // Chọn format trả về dựa trên content-type gốc
    let outBuffer;
    if (contentType.includes("png")) {
      outBuffer = await pipeline.png().toBuffer();
    } else {
      outBuffer = await pipeline.jpeg().toBuffer();
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": contentType.includes("png") ? "image/png" : "image/jpeg" },
      body: outBuffer.toString("base64"),
      isBase64Encoded: true
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
