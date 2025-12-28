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

    // 🔍 Collect URLs from all possible places
    let urls = [];

    if (Array.isArray(data?.videoFormats)) {
      urls = data.videoFormats
        .filter(v => v.url)
        .map(v => v.url);
    }

    if (Array.isArray(data?.audioFormats)) {
      urls.push(
        ...data.audioFormats
          .filter(a => a.url)
          .map(a => a.url)
      );
    }

    if (Array.isArray(data?.formats)) {
      urls.push(
        ...data.formats
          .filter(f => f.url)
          .map(f => f.url)
      );
    }

    // remove duplicates
    urls = [...new Set(urls)];

    return res.status(200).json({
      status: "success",
      title: data.title,
      urls
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch video info",
      error: err.message
    });
  }
      }
