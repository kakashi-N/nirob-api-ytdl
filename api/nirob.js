import axios from "axios";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: "error",
      message: "Missing url parameter"
    });
  }

  try {
    const apiUrl =
      "https://ytdl.socialplug.io/api/video-info?url=" +
      encodeURIComponent(url);

    const response = await axios.get(apiUrl, {
      headers: {
        authority: "ytdl.socialplug.io",
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        origin: "https://www.socialplug.io",
        referer: "https://www.socialplug.io/",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Mobile Safari/537.36"
      }
    });

    // ✅ OPTIONAL: filter only mp4 formats
    const data = response.data;

    const videos =
      data?.formats?.filter(
        (f) => f.ext === "mp4" && f.url
      ) || [];

    return res.status(200).json({
      status: "success",
      title: data.title,
      duration: data.duration,
      videos
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch video info",
      error: err.message
    });
  }
    }
