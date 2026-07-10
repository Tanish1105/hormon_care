import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getYoutubeVideoId } from "@/lib/youtube";
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

  const youtubeUrl = await getPatientYoutubeUrl(contentId, source, session.id);
  const videoId = youtubeUrl ? getYoutubeVideoId(youtubeUrl) : null;
  if (!videoId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const thumbRes = await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
  if (!thumbRes.ok) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await thumbRes.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
