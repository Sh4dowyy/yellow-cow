export function getAdminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = getAdminEmails();
  return list.includes(email.toLowerCase());
}

export function isAdminFromUser(user: { email?: string | null; user_metadata?: Record<string, any> } | null | undefined): boolean {
  if (!user) return false;
  const role = user.user_metadata?.role?.toString().toLowerCase();
  const isFlag = Boolean(user.user_metadata?.is_admin);
  if (isFlag || role === "admin") return true;
  return isAdminEmail(user.email || null);
}


