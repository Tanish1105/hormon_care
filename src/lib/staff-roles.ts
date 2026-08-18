import type { StaffRole } from "@/lib/auth";

export type StaffPermission =
  | "patients.read"
  | "patients.create"
  | "patients.update"
  | "patients.delete"
  | "patients.credentials"
  | "patients.assignStaff"
  | "plans.read"
  | "plans.assign"
  | "plans.write"
  | "followups.read"
  | "followups.write"
  | "followups.delete"
  | "followups.settings"
  | "assessments.read"
  | "assessments.write"
  | "supplements.read"
  | "supplements.write"
  | "inquiries.manage"
  | "staff.manage"
  | "upload";

const ALL_PERMISSIONS: StaffPermission[] = [
  "patients.read",
  "patients.create",
  "patients.update",
  "patients.delete",
  "patients.credentials",
  "patients.assignStaff",
  "plans.read",
  "plans.assign",
  "plans.write",
  "followups.read",
  "followups.write",
  "followups.delete",
  "followups.settings",
  "assessments.read",
  "assessments.write",
  "supplements.read",
  "supplements.write",
  "inquiries.manage",
  "staff.manage",
  "upload",
];

const ROLE_PERMISSIONS: Record<StaffRole, StaffPermission[]> = {
  ADMIN: ALL_PERMISSIONS,
  DOCTOR: [
    "patients.read",
    "plans.read",
    "followups.read",
    "assessments.read",
    "assessments.write",
    "supplements.read",
  ],
  DOCTOR_STAFF: [
    "patients.read",
    "patients.create",
    "patients.update",
    "patients.credentials",
    "plans.read",
    "followups.read",
    "followups.write",
    "assessments.read",
    "assessments.write",
    "supplements.read",
  ],
  DIETITIAN: [
    "patients.read",
    "patients.update",
    "plans.read",
    "plans.assign",
    "plans.write",
    "followups.read",
    "assessments.read",
    "supplements.read",
    "supplements.write",
    "upload",
  ],
};

export type StaffCapabilities = {
  role: StaffRole;
  basePath: string;
  panelLabel: string;
  canManageStaff: boolean;
  canManageInquiries: boolean;
  canWritePlans: boolean;
  canAssignPlans: boolean;
  canCreatePatients: boolean;
  canDeletePatients: boolean;
  canEditCredentials: boolean;
  canAssignStaff: boolean;
  canFillFollowups: boolean;
  canEditFollowups: boolean;
  canDeleteFollowups: boolean;
  canManageFollowupSettings: boolean;
  canWriteAssessments: boolean;
  canManageSupplements: boolean;
  canUpload: boolean;
  showDoctorSelect: boolean;
  showDietitianSelect: boolean;
};

export function panelPath(role: StaffRole) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "DOCTOR":
      return "/doctor";
    case "DOCTOR_STAFF":
      return "/staff";
    case "DIETITIAN":
      return "/dietitian";
  }
}

export function panelLabel(role: StaffRole) {
  switch (role) {
    case "ADMIN":
      return "Admin Panel";
    case "DOCTOR":
      return "Doctor Panel";
    case "DOCTOR_STAFF":
      return "Staff Panel";
    case "DIETITIAN":
      return "Dietitian Panel";
  }
}

export function hasPermission(role: StaffRole, permission: StaffPermission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function capabilitiesFor(role: StaffRole): StaffCapabilities {
  return {
    role,
    basePath: panelPath(role),
    panelLabel: panelLabel(role),
    canManageStaff: hasPermission(role, "staff.manage"),
    canManageInquiries: hasPermission(role, "inquiries.manage"),
    canWritePlans: hasPermission(role, "plans.write"),
    canAssignPlans: hasPermission(role, "plans.assign"),
    canCreatePatients: hasPermission(role, "patients.create"),
    canDeletePatients: hasPermission(role, "patients.delete"),
    canEditCredentials: hasPermission(role, "patients.credentials"),
    canAssignStaff: hasPermission(role, "patients.assignStaff"),
    canFillFollowups: hasPermission(role, "followups.write"),
    canEditFollowups: hasPermission(role, "followups.write"),
    canDeleteFollowups: hasPermission(role, "followups.delete"),
    canManageFollowupSettings: hasPermission(role, "followups.settings"),
    canWriteAssessments: hasPermission(role, "assessments.write"),
    canManageSupplements: hasPermission(role, "supplements.write"),
    canUpload: hasPermission(role, "upload"),
    showDoctorSelect: role === "ADMIN",
    showDietitianSelect: role === "ADMIN",
  };
}
