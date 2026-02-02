import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zuimi | Zuimi is building the future of African cinema.",
  description:
    "Zuimi is building the future of African cinema. A streaming platform with local roots and global ambition that celebrates our stories, rewards our filmmakers, and delivers the ultimate film experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 

const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>; 

  if (!isAuthenticated) {
    if (typeof window !== "undefined") router.push("/login");
    return null; 
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
