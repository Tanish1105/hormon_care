import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildSecureYoutubeEmbedUrl, getYoutubeVideoId } from "@/lib/youtube";
import { getPatientYoutubeUrl } from "@/lib/patient-youtube";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { contentId } = await params;
  const source = request.nextUrl.searchParams.get("source") || "plan";
  const autoplay = request.nextUrl.searchParams.get("autoplay") === "1";

  const youtubeUrl = await getPatientYoutubeUrl(contentId, source, session.id);
  const videoId = youtubeUrl ? getYoutubeVideoId(youtubeUrl) : null;
  if (!videoId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const embedUrl = buildSecureYoutubeEmbedUrl(videoId, autoplay);
  const html = `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0}html,body{height:100%;background:#000;overflow:hidden}iframe{border:0;width:100%;height:100%}</style>
</head><body>
<iframe src="${embedUrl}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
      "Cache-Control": "private, no-store",
    },
  });
}
