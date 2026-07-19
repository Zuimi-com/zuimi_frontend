import axios, { AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "@/lib/auth-cookies";

export type Row = {
  subject: string;
  dateSent: string;
  status: "Sent" | "Draft";
  openRate: string;
};

export interface User {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  user_name: string | null;
  email: string;
  profile_picture: string | null;
}

export type Record = {
  name: string;
  email: string;
  dateSubscribed: string;
  status: 'Active' | 'Inactive'
}

const Baseurl = getApiBaseUrl();


async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  data?: any,
  token?: string
): Promise<T> {
  try {
    const authorizationToken = token ?? getAccessToken();

    const config: AxiosRequestConfig = {
      method,
      url: `${Baseurl}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...(authorizationToken
          ? { Authorization: `Bearer ${authorizationToken}` }
          : {}),
      },
      data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    const responseData = error.response?.data;
    const message =
      responseData?.message ||
      responseData?.error ||
      responseData?.detail ||
      "Request failed";
    toast.error(message);
    throw new Error(message);
  }
}


export const adminLogin = (email: string, password: string) =>
  apiRequest("/login/admin/", "POST", { email, password });


export const userLogin = (email: string, password: string) =>
  apiRequest("/login/", "POST", { email, password });


export const generateToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token found");

  const data = await apiRequest<{ access: string }>(
    "/token/generate-access-token/",
    "POST",
    { refresh: refreshToken }
  );

  setAccessToken(data.access);

  return data.access;
};


export const getCurrentUser = (token: string) =>
  apiRequest<User>("/user/profile/", "GET", undefined, token);


export const getNewsletterHistory = (token: string) =>
  apiRequest<Row[]>("/newsletter/broadcasts/", "GET", undefined, token);


export const getSubscribersOverview = (token: string) =>
  apiRequest<Record[]>("/newsletter/waitlist/", "GET", undefined, token);



/*export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${Baseurl}/api/login/admin/`,
      { email, password },
      {
        headers: {  'Content-Type': 'application/json' },
        }
    );
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    toast.error(message);
    throw new Error(message);
  }
};

export const userLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${Baseurl}/api/login/`,
      { email, password },
      {
        headers: {  'Content-Type': 'application/json' },
        }
    );
    return response.data;
  } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
    throw new Error(message);
  }
};



export const generateToken = async (): Promise<string> => {
  try {
    const refreshToken = Cookies.get("refresh_token");

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }
    const response = await axios.post(`${Baseurl}/api/token/generate-access-token/`, {refresh: refreshToken}, {
      headers: { "Content-Type": "application/json" },
    });
    Cookies.set("access_token", response.data.access, {
      expires: 7,
      secure: true,
      sameSite: "strict"
    });
    return response.data.access;
  } catch (error: any) {
    const message = error.response?.data?.message || "Token generation failed";
    toast.error(message);
    throw new Error(message);
  }
};


export const getNewsletterHistory = async (token: string): Promise<Row[]> => {
  try {
    const response = await axios.get<Row[]>(`${Baseurl}/api/newsletter/broadcasts/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch newsletter history";
    toast.error(message);
    throw new Error(message);
  }
};

export async function getCurrentUser(token: string): Promise<User> {
  const response = await axios.get(`${Baseurl}/api/user/profile/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  try {
  return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch data";
    toast.error(message);
    throw new Error(message);
  }
}

export const getSubscribersOverview = async (token: string): Promise<Record[]> => {
  try {
    const response = await axios.get<Record[]>(`${Baseurl}/api/newsletter/waitlist/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to subscribe";
    toast.error(message);
    throw new Error(message);
  }
}; */
