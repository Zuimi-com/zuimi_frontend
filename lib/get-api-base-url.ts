const FALLBACK_API_ORIGIN =
  process.env.NODE_ENV === "production"
    ? "https://zuimi.onrender.com"
    : "http://localhost:8000";

const normalizeOrigin = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.replace(/\/api$/, "");
};

const isVercelFrontendHost = (value: string) => {
  try {
    const host = new URL(value).hostname;
    return host.endsWith("vercel.app");
  } catch {
    return false;
  }
};

export const getApiBaseUrl = () => {
  const rawConfiguredOrigin =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_STAGING ||
    FALLBACK_API_ORIGIN;

  const configuredOrigin =
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_BACKEND_URL &&
    isVercelFrontendHost(rawConfiguredOrigin)
      ? FALLBACK_API_ORIGIN
      : rawConfiguredOrigin;

  return `${normalizeOrigin(configuredOrigin)}/api`;
};