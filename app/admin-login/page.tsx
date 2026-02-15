"use client";
import { useAdminLogin } from "@/features/auth/service/auth";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import visibiltyOn from "../../public/eye-icon.svg";
import lock from "../../public/lock.svg";
import mail from "../../public/outline-email.svg";
import visibilityOff from "../../public/visibility-off.svg";
import Logo from "../../public/Zuimi Logo.svg";

const inter = Inter({
  subsets: ["latin"],
});

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const adminLogin = useAdminLogin();

  const router = useRouter();

  const loading = adminLogin.isPending;
  const isDisabled = (loading && !email) || !password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          Cookies.set("access", data.access, {
            expires: 7,
            secure: true,
            sameSite: "strict",
          });
          toast("Login Successful");
          router.push("/admin");
        },
      },
    );
  };

  return (
    <div className="bg-gradient-to-t from-[#101727] to-[#000000] min-h-screen pt-2">
      <div>
        <Image
          src={Logo}
          alt="logo"
          className="w-[166.96px] h-[32.92px] mt-[52.68px] ml-[90px]"
        />
      </div>

      <div className="flex flex-col gap-8 mt-18">
        <div
          className={`${inter.className} font-bold text-[#FFFFFF] text-[32px] flex justify-center items-center`}
        >
          <p>Admin Login</p>
        </div>

        <div className="flex items-center justify-center mt-">
          <form
            onSubmit={handleSubmit}
            className="border-[1px] border-[#FFFFFF33] bg-[#EFEDED0D] rounded-[24px] w-[834px] h-[410px] p-[41px] space-y-6"
          >
            <div className="relative">
              <span className="block text-[#FFFFFF] mb-1"> Admin Email </span>

              {!email && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-[#6A7280] pt-6">
                  <Image src={mail} alt="mail" width={20} height={20} />
                  <span>admin@zuimi.com</span>
                </div>
              )}

              <input
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                className="border-[1px] pl-5 text-white border-[#FFFFFF33] w-[752px] h-[48px] rounded-xl bg-[#FFFFFF1A]"
              />
            </div>

            <div className="relative">
              <span className="block text-[#FFFFFF] mb-1"> Password </span>

              {!password && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-[#6A7282] pt-6">
                  <Image src={lock} alt="lock" width={20} height={20} />
                  <span>Enter your password</span>
                </div>
              )}
              <input
                value={password}
                type={showPassword ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[1px] text-white pl-5 border-[#FFFFFF33] w-[752px] h-[48px] rounded-xl bg-[#FFFFFF1A]"
              />

              <button
                type="button"
                aria-hidden
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 mr-4  -translate-y-1/2 cursor-pointer pt-6"
              >
                {showPassword ? (
                  <Image
                    src={visibilityOff}
                    alt="visibility"
                    className="w-[20px] h-[20px]"
                  />
                ) : (
                  <Image
                    src={visibiltyOn}
                    alt="visibility"
                    className="w-[20px] h-[20px]"
                  />
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href={"/forget-password"}
                type="button"
                className="text-[#5F67C7]"
              >
                Forgot Password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isDisabled}
                className={`inline-flex items-center justify-center rounded-md w-[752px] h-[48px] ${isDisabled ? "bg-[#1684EF] " : "bg-[#1684EF] cursor-pointer"} px-4 py-2 text-lg font-medium text-white hover:opacity-95`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Login to Admin Portal"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
