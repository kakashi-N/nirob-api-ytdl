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
        origin: "https://www.socialplug.io",
        referer: "https://www.socialplug.io/",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Mobile Safari/537.36"
      }
    });

    const data = response.data;

    let videos = [];

    // 🔥 Filter ONLY VIDEO formats
    const allFormats = [
      ...(data.videoFormats || []),
      ...(data.formats || [])
    ];

    videos = allFormats
      .filter(f =>
        f.url &&
        (
          f.hasVideo === true ||
          f.mimeType?.startsWith("video/") ||
          f.qualityLabel
        )
      )
      .map(f => ({
        quality: f.qualityLabel || "unknown",
        mimeType: f.mimeType,
        url: f.url
      }));

    // remove duplicate urls
    videos = videos.filter(
      (v, i, self) =>
        i === self.findIndex(x => x.url === v.url)
    );

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
