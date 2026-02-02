import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export type Row = {
  subject: string;
  dateSent: string;
  status: "Sent" | "Draft";
  openRate: string;
};

export interface User {
  name: string;
  email: string;
  image: string;
}

export type Record = {
  name: string;
  email: string;
  dateSubscribed: string;
  status: 'Active' | 'Inactive'
}

const Baseurl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_STAGING || 'http://localhost:8000';

const AuthorizationToken = Cookies.get("access_token");

export const adminLogin = async (email: string, password: string) => {
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
};
