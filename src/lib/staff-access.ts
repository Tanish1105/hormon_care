import { NextResponse } from "next/server";
import { getSession, isStaffRole, type SessionUser, type StaffRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  hasPermission,
  type StaffPermission,
} from "@/lib/staff-roles";

export type { StaffPermission, StaffCapabilities } from "@/lib/staff-roles";
export {
  capabilitiesFor,
  hasPermission,
  panelLabel,
  panelPath,
} from "@/lib/staff-roles";


export type StaffSession = SessionUser & { role: StaffRole };

export type StaffAccess =
  | { ok: true; session: StaffSession }
  | { ok: false; response: NextResponse };

export async function requireStaffSession(permission?: StaffPermission): Promise<StaffAccess> {
  const session = await getSession();
  if (!session || !isStaffRole(session.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (permission && !hasPermission(session.role, permission)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, session: session as StaffSession };
}

export function scopedDoctorId(session: StaffSession): string | null {
  if (session.role === "DOCTOR") return session.id;
  if (session.role === "DOCTOR_STAFF") return session.doctorId ?? null;
  return null;
}

export function patientWhereFor(session: StaffSession): {
  id?: string;
  doctorId?: string;
  dietitianId?: string;
} {
  if (session.role === "ADMIN") return {};
  if (session.role === "DIETITIAN") return { dietitianId: session.id };
  const doctorId = scopedDoctorId(session);
  if (!doctorId) return { id: "__none__" };
  return { doctorId };
}

export async function canAccessPatient(session: StaffSession, patientId: string) {
  const patient = await prisma.patientProfile.findUnique({
    where: { id: patientId },
    select: { id: true, doctorId: true, dietitianId: true },
  });
  if (!patient) return { patient: null, allowed: false };
  if (session.role === "ADMIN") return { patient, allowed: true };
  if (session.role === "DIETITIAN") {
    return { patient, allowed: patient.dietitianId === session.id };
  }
  const doctorId = scopedDoctorId(session);
  return { patient, allowed: Boolean(doctorId) && patient.doctorId === doctorId };
}

export async function resolveCareTeamIds(
  session: StaffSession,
  requestedDoctorId?: string | null,
  requestedDietitianId?: string | null
): Promise<{ doctorId: string | null; dietitianId: string | null; error?: string }> {
  let doctorId: string | null = null;
  let dietitianId: string | null = null;

  if (session.role === "DOCTOR_STAFF" || session.role === "DOCTOR") {
    doctorId = scopedDoctorId(session);
    if (!doctorId) {
      return { doctorId: null, dietitianId: null, error: "This staff account is not linked to a doctor" };
    }
  } else if (session.role === "ADMIN" && requestedDoctorId) {
    const doctor = await prisma.user.findUnique({ where: { id: requestedDoctorId } });
    if (!doctor || doctor.role !== "DOCTOR") {
      return { doctorId: null, dietitianId: null, error: "Selected doctor was not found" };
    }
    doctorId = doctor.id;
  }

  const dietitianRequest =
    session.role === "DIETITIAN" ? session.id : requestedDietitianId || null;
  if (dietitianRequest) {
    const dietitian = await prisma.user.findUnique({ where: { id: dietitianRequest } });
    if (!dietitian || dietitian.role !== "DIETITIAN") {
      return { doctorId: null, dietitianId: null, error: "Selected dietitian was not found" };
    }
    dietitianId = dietitian.id;
  }

  return { doctorId, dietitianId };
}

export async function requirePatientAccess(
  session: StaffSession,
  patientId: string
): Promise<StaffAccess & { patientId?: string }> {
  const { patient, allowed } = await canAccessPatient(session, patientId);
  if (!patient) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Patient not found" }, { status: 404 }),
    };
  }
  if (!allowed) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, session, patientId };
}
