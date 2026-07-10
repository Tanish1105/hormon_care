export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function buildSecureYoutubeEmbedUrl(videoId: string, autoplay = false) {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    disablekb: "1",
    fs: "1",
    playsinline: "1",
    controls: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}
