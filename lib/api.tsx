import axios from "axios";
import toast from "react-hot-toast";

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
