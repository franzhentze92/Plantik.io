const DEFAULT_ADMIN_EMAILS = [
  "admin@plantik.io",
  "franz@nutri-tech.com.au",
  "hentzefranz92@gmail.com",
];

export function getAdminEmails(): string[] {
  const fromEnv =
    process.env.ORDER_ADMIN_EMAIL?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  return [
    ...new Set(
      [...DEFAULT_ADMIN_EMAILS, ...fromEnv].map((email) => email.toLowerCase())
    ),
  ];
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
