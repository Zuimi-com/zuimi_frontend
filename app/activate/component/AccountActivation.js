"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const ActivateAccount = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      setError(true);
      setMessage("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      setError(false);
      setMessage("");

      const response = await axios.post("http://127.0.0.1:8000/api/user/activate/", {
        token: code,
      });

      setMessage("Account activated successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      console.error("Activation failed:", err);
      setError(true);
      setMessage("Activation failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-96 p-6 shadow-lg bg-white rounded-lg text-center">
        <h1 className="text-2xl font-semibold mb-4">Activate Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit activation code"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-center"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Activating..." : "Activate"}
          </button>
        </form>
        {message && (
          <p className={`mt-4 ${error ? "text-red-600" : "text-green-600"}`}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
