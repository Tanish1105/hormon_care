import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFollowupCompulsory, setFollowupCompulsory } from "@/lib/app-settings";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const compulsory = await getFollowupCompulsory();
  return NextResponse.json({ compulsory });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (typeof body.compulsory !== "boolean") {
    return NextResponse.json({ error: "compulsory must be a boolean" }, { status: 400 });
  }

  await setFollowupCompulsory(body.compulsory);
  return NextResponse.json({ compulsory: body.compulsory });
}
