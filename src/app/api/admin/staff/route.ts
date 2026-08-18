import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireStaffSession } from "@/lib/staff-access";

const MANAGED_ROLES = ["DOCTOR", "DOCTOR_STAFF", "DIETITIAN"] as const;
type ManagedRole = (typeof MANAGED_ROLES)[number];

function isManagedRole(role: string): role is ManagedRole {
  return MANAGED_ROLES.includes(role as ManagedRole);
}

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

export async function GET() {
  const access = await requireStaffSession();
  if (!access.ok) return access.response;
  const session = access.session;

  if (session.role === "ADMIN") {
    const users = await prisma.user.findMany({
      where: { role: { in: [...MANAGED_ROLES] } },
      select: staffSelect,
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });
    const doctors = users
      .filter((u) => u.role === "DOCTOR")
      .map((u) => ({ id: u.id, name: u.name, username: u.username }));
    const dietitians = users
      .filter((u) => u.role === "DIETITIAN")
      .map((u) => ({ id: u.id, name: u.name, username: u.username }));
    return NextResponse.json({ users, doctors, dietitians });
  }

  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: { id: true, name: true, username: true },
    orderBy: { name: "asc" },
  });
  const dietitians = await prisma.user.findMany({
    where: { role: "DIETITIAN" },
    select: { id: true, name: true, username: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ doctors, dietitians });
}

export async function POST(request: NextRequest) {
  const access = await requireStaffSession("staff.manage");
  if (!access.ok) return access.response;

  const { name, username, password, role, doctorId } = await request.json();
  const trimmedName = String(name ?? "").trim();
  const trimmedUsername = String(username ?? "").trim();
  const trimmedPassword = String(password ?? "").trim();
  const trimmedRole = String(role ?? "").trim();

  if (!trimmedName || !trimmedUsername || !trimmedPassword || !isManagedRole(trimmedRole)) {
    return NextResponse.json(
      { error: "Name, username, password and a valid role are required" },
      { status: 400 }
    );
  }

  if (trimmedUsername.length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
  }
  if (trimmedPassword.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
  }

  if (trimmedRole === "DOCTOR_STAFF" && !doctorId) {
    return NextResponse.json({ error: "Select a doctor for this staff member" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: trimmedUsername } });
  if (existing) {
    return NextResponse.json({ error: "This username is already in use" }, { status: 400 });
  }

  let linkedDoctorId: string | null = null;
  if (trimmedRole === "DOCTOR_STAFF") {
    const doctor = await prisma.user.findUnique({ where: { id: String(doctorId) } });
    if (!doctor || doctor.role !== "DOCTOR") {
      return NextResponse.json({ error: "Selected doctor was not found" }, { status: 400 });
    }
    linkedDoctorId = doctor.id;
  }

  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      username: trimmedUsername,
      password: await hashPassword(trimmedPassword),
      role: trimmedRole,
      doctorId: linkedDoctorId,
    },
    select: staffSelect,
  });

  return NextResponse.json({
    user,
    credentials: { username: trimmedUsername, password: trimmedPassword },
  });
}
