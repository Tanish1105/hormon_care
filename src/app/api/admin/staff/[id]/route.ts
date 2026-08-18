import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireStaffSession } from "@/lib/staff-access";

const MANAGED_ROLES = ["DOCTOR", "DOCTOR_STAFF", "DIETITIAN"] as const;

const staffSelect = {
  id: true,
  username: true,
  name: true,
  role: true,
  doctorId: true,
  createdAt: true,
  doctor: { select: { id: true, name: true, username: true } },
  _count: {
    select: {
      patientsAsDoctor: true,
      patientsAsDietitian: true,
      staffMembers: true,
    },
  },
} as const;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("staff.manage");
  if (!access.ok) return access.response;

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !MANAGED_ROLES.includes(user.role as (typeof MANAGED_ROLES)[number])) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  const { name, username, password, doctorId } = await request.json();
  const data: {
    name?: string;
    username?: string;
    password?: string;
    doctorId?: string | null;
  } = {};

  if (typeof name === "string" && name.trim()) data.name = name.trim();

  if (typeof username === "string" && username.trim()) {
    const nextUsername = username.trim();
    if (nextUsername !== user.username) {
      const existing = await prisma.user.findUnique({ where: { username: nextUsername } });
      if (existing) {
        return NextResponse.json({ error: "This username is already in use" }, { status: 400 });
      }
    }
    data.username = nextUsername;
  }

  if (typeof password === "string" && password.trim()) {
    if (password.trim().length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }
    data.password = await hashPassword(password.trim());
  }

  if (user.role === "DOCTOR_STAFF" && doctorId !== undefined) {
    if (!doctorId) {
      return NextResponse.json({ error: "Select a doctor for this staff member" }, { status: 400 });
    }
    const doctor = await prisma.user.findUnique({ where: { id: String(doctorId) } });
    if (!doctor || doctor.role !== "DOCTOR") {
      return NextResponse.json({ error: "Selected doctor was not found" }, { status: 400 });
    }
    data.doctorId = doctor.id;
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: staffSelect,
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireStaffSession("staff.manage");
  if (!access.ok) return access.response;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { staffMembers: true } },
    },
  });
  if (!user || !MANAGED_ROLES.includes(user.role as (typeof MANAGED_ROLES)[number])) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  if (user.role === "DOCTOR" && user._count.staffMembers > 0) {
    return NextResponse.json(
      { error: "Remove or reassign this doctor's staff first" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
