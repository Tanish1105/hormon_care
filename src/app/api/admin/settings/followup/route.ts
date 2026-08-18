import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/staff-access";
import { getFollowupCompulsory, setFollowupCompulsory } from "@/lib/app-settings";

export async function GET() {
  const access = await requireStaffSession("followups.read");
  if (!access.ok) return access.response;
  const session = access.session;

  const compulsory = await getFollowupCompulsory();
  return NextResponse.json({ compulsory });
}

export async function PUT(req: Request) {
  const access = await requireStaffSession("followups.settings");
  if (!access.ok) return access.response;
  const session = access.session;

  const body = await req.json();
  if (typeof body.compulsory !== "boolean") {
    return NextResponse.json({ error: "compulsory must be a boolean" }, { status: 400 });
  }

  await setFollowupCompulsory(body.compulsory);
  return NextResponse.json({ compulsory: body.compulsory });
}
