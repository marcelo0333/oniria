"use client";

import React, { useActionState, useState } from "react";
import SocialButton from "../../../components/ui/auth/SocialButton";
import { AppleIcon, ChromeIcon, FacebookIcon, XIcon } from "lucide-react";
import Divider from "../../../components/ui/auth/Divider";
import Input from "../../../components/ui/auth/Input";
import Link from "next/link";
import { FormComponent } from '../../../components/ui/FormComponent';
import { signin } from "@/actions/auth";

export default function SignIn() {

  const [state, action, pending] = useActionState(signin, undefined)
  

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
            Sign in to your account
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            See your dreams
          </p>
        </div>

        {/* Social login */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <SocialButton>
            <FacebookIcon />
          </SocialButton>

          <SocialButton>
            <XIcon />
          </SocialButton>

          <SocialButton>
            <ChromeIcon />
          </SocialButton>
        </div>

        <Divider />

        {/* Form */}
        <form className="space-y-4" action={action}>
          <Input placeholder="Email" type="email" id="email" name="email"/>
          <Input placeholder="Password" type="password" id="password" name="password"  />
          <p className="align-top text-sm text-zinc-400">
          Forget password?{" "}
            <Link href="forget-password" className="text-purple-400 hover:underline cursor-pointer" >
              Recovery
            </Link>
            </p>
          <button
            disabled={pending}
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
            Sign In
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
