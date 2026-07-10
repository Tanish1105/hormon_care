import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createToken,
  attachSessionCookie,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username અને password જરૂરી છે" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { patientProfile: true },
    });

    if (!user || user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "અમાન્ય credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "અમાન્ય credentials" },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: user.id,
      username: user.username,
      role: "PATIENT",
      name: user.name,
    });

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, name: user.name, role: "PATIENT" },
    });
    return attachSessionCookie(response, token);
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
