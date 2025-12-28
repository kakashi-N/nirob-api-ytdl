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
        origin: "https://www.socialplug.io",
        referer: "https://www.socialplug.io/",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome Mobile Safari/537.36"
      }
    });

    const data = response.data;

    let videos = [];

    const allFormats = [
      ...(data.formats || []),
      ...(data.videoFormats || [])
    ];

    videos = allFormats
      .filter(f =>
        f.url &&
        typeof f.mimeType === "string" &&
        f.mimeType.includes("video")
      )
      .map(f => ({
        quality: f.qualityLabel || f.quality || "unknown",
        mimeType: f.mimeType,
        url: f.url
      }));

    // remove duplicate urls
    videos = [...new Map(videos.map(v => [v.url, v])).values()];

    return res.status(200).json({
      status: "success",
      title: data.title,
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
