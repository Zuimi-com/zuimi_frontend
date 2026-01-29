import axios from "axios";
import toast from "react-hot-toast";

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
    const response = await axios.post(`${Baseurl}/api/token/generate-access-token/`, {
      headers: { "Content-Type": "application/json" },
    });

    
    return response.data.token;
  } catch (error: any) {
    const message = error.response?.data?.message || "Token generation failed";
    toast.error(message);
    throw new Error(message);
  }
};


export const getNewsletterHistory = async (token: string): Promise<Row[]> => {
  try {
    const response = await axios.get<Row[]>(`${Baseurl}/api/newsletter/broadcast/`, {
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
  const response = await axios.get('/api/user/profile', {
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
    const response = await axios.get<Record[]>(`${Baseurl}/api/newsletter/subscribe/`, {
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
