export const COOKIE_SESSION_KEY = "NEO_DRIVE_SESSION_ID";
export const ADMIN_COOKIE_SESSION_KEY = "NEO_DRIVE_ADMIN_SESSION_ID";
export const SESSION_EXPIRATION = 60 * 60 * 24 * 7; // 7 days
export const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

export const SUBSCRIPTION_LIMITS = {
  free: 200 * 1024 * 1024, // 200MB
  pro: 10 * 1024 * 1024 * 1024, // 10GB
  premium: 100 * 1024 * 1024 * 1024, // 100GB
};

export const ADMIN_CREDENTIALS = [
  { name: "admin", password: "admin123456" },
  { name: "superadmin", password: "super123456" },
];
