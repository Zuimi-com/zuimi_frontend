import Cookies from "js-cookie";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const cookieOptions = () => ({
  expires: 7,
  path: "/",
  sameSite: "strict" as const,
  secure:
    typeof window !== "undefined" && window.location.protocol === "https:",
});

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_COOKIE);

export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_COOKIE);

export const setAccessToken = (accessToken: string) => {
  Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions());
};

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  setAccessToken(accessToken);
  Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions());
};

export const clearAuthTokens = () => {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_COOKIE, { path: "/" });
};
