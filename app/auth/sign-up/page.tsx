"use client";

import React, { useActionState } from "react";
import SocialButton from "../../../components/ui/auth/SocialButton";
import { AppleIcon, ChromeIcon, FacebookIcon, XIcon } from "lucide-react";
import Divider from "../../../components/ui/auth/Divider";
import Input from "../../../components/ui/auth/Input";
import Link from "next/link";
import { signup } from "@/actions/auth";


export default function SignUp() {

    const [state, action, pending] = useActionState(signup, undefined)


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
          p-8
        "
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">
            Create your account
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Start exploring your dreams
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
          <Input placeholder="Name" name="name" id="name" />
          {state?.errors?.name && <p className="text-red-500 text-sm">{state.errors.name}</p>}
          <Input placeholder="Email" type="email" name="email" id="email" />
          {state?.errors?.email && <p className="text-red-500 text-sm">{state.errors.email}</p>}
          <Input placeholder="Password" type="password" name="password" id="password" />
          {state?.errors?.password && (
            <div className="text-red-500 text-sm">
              <p className="font-semibold">Password must:</p>
              <ul className="list-disc list-inside">
                {state.errors.password.map((error) => (
                  <li key={error}>- {error}</li>
                ))}
              </ul>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" className="accent-purple-500" name="readTerms" id="readTerms" />
            I agree to the Terms and Conditions
          </label>

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
            Sign up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="sign-in" className="text-purple-400 hover:underline cursor-pointer" >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
