export type AccessLevel = "none" | "view" | "manage";
export type AdminUser = {
  id: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_dashboard_admin: boolean;
  permissions: Partial<Record<string, AccessLevel>>;
  capabilities?: { manage_operators?: boolean; manage_admins?: boolean };
};

const sectionsByPath: Readonly<Record<string, string>> = {
  "/admin/movies": "catalog",
  "/admin/actors": "catalog",
  "/admin/directors": "catalog",
  "/admin/genres": "catalog",
  "/admin/producers": "producers",
  "/admin/newsletter": "newsletter",
  "/admin/subscribers": "newsletter",
  "/admin/images": "newsletter",
  "/admin/creator-applications": "creators",
  "/admin/reports": "reports",
  "/admin/forensics": "forensics",
  "/admin/audit": "audit",
  "/eco/boarddash/55019": "coordination",
};

export function hasAdminPermission(
  admin: AdminUser | null | undefined,
  section: string,
  level: "view" | "manage" = "view",
) {
  if (admin?.is_superuser) return true;
  const permission = admin?.permissions?.[section];
  return permission === "manage" || (level === "view" && permission === "view");
}

export function canVisitAdminPage(admin: AdminUser | null, pathname: string) {
  if (!admin) return false;
  const path = pathname.replace(/\/+$/, "");
  if (path === "/admin" || path === "/admin/tutorials") return true;
  if (path === "/admin/operators" || path === "/admin/admins") return admin.is_superuser;
  if (path === "/admin/compose-letter") return hasAdminPermission(admin, "newsletter", "manage");
  const section = sectionsByPath[path];
  return !!section && hasAdminPermission(admin, section);
}

export function adminError(body: Record<string, unknown>) {
  if (typeof body.detail === "string") return body.detail;
  const errors = Object.values(body).flat().filter((message): message is string => typeof message === "string");
  return errors.join(" ") || "The request could not be completed.";
}
