import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/staff-access";
import { saveUpload } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const access = await requireStaffSession("upload");
  if (!access.ok) return access.response;
  const session = access.session;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "image" | "video" | null;

    if (!file || !type || (type !== "image" && type !== "video")) {
      return NextResponse.json({ error: "File and type are required" }, { status: 400 });
    }

    const url = await saveUpload(file, type);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }
}
