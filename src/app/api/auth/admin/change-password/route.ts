import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { requireStaffSession } from "@/lib/staff-access";

export async function POST(request: NextRequest) {
  try {
    const access = await requireStaffSession();
    if (!access.ok) return access.response;
    const session = access.session;

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    const trimmedCurrentPassword = String(currentPassword ?? "");
    const trimmedNewPassword = String(newPassword ?? "");
    const trimmedConfirmPassword = String(confirmPassword ?? "");

    if (!trimmedCurrentPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
      return NextResponse.json({ error: "બધા fields ભરવા જરૂરી છે" }, { status: 400 });
    }

    if (trimmedNewPassword.length < 6) {
      return NextResponse.json(
        { error: "New password ઓછામાં ઓછું 6 characters હોવું જોઈએ" },
        { status: 400 }
      );
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      return NextResponse.json(
        { error: "New password અને confirm password મેળ ખાતા નથી" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const isCurrentValid = await verifyPassword(trimmedCurrentPassword, user.password);
    if (!isCurrentValid) {
      return NextResponse.json({ error: "Current password ખોટો છે" }, { status: 401 });
    }

    const hashedPassword = await hashPassword(trimmedNewPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password સફળતાપૂર્વક બદલાઈ ગયો" });
  } catch {
    return NextResponse.json({ error: "Password change failed" }, { status: 500 });
  }
}
