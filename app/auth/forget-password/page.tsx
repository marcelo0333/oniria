"use client";

import React from "react";
import SocialButton from "../../../components/ui/auth/SocialButton";
import { AppleIcon, ChromeIcon, FacebookIcon, XIcon } from "lucide-react";
import Divider from "../../../components/ui/auth/Divider";
import Input from "../../../components/ui/auth/Input";
import Link from "next/link";

export default function ForgetPassword() {
  const [send, setSend] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const formSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Recovering password for:", email);
    setSend(true);
  }

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-center min-h-screen relative">
      <Link href="/" className="fixed top-4 left-4 text-zinc-400 hover:text-zinc-200">
        ← Back to Home
      </Link>
      <div
        className="
          relative
          rounded-2xl
          bg-white/5
          backdrop-blur-xl
          border border-white/10
          shadow-xl shadow-black/40
          justify-center
          items-center
          p-8
        "
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">
            Recovery Password
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Check your email to reset your password
          </p>
        </div>

        {send && (
          <p className="text-sm text-green-400 ">
            If an account with that email exists, a password recovery link has been sent.
          </p>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={formSubmit}>
          <Input placeholder="Email" type="email" value={email} id="email" onChange={(e) => setEmail(e.target.value)} />

          <button
            type="submit"
            className="
              w-full
              py-3
              mt-2
              rounded-xl
              font-semibold
              text-white
              bg-gradient-to-r from-purple-500 to-indigo-500
              shadow-lg shadow-purple-500/30
              transition-all
              hover:shadow-purple-500/50
              hover:scale-[1.02]
              active:scale-[0.97]
            "
          >
            Recover Password
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          You dont have an account?{" "}
          <Link href="sign-up" className="text-purple-400 hover:underline cursor-pointer" >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
