import Link from 'next/link'
import React from 'react'
import UserComponent from './auth/UserComponent';

interface HeaderProps {
    user?: {
        id: string | undefined;
        name: string | undefined;
        email: string | undefined;
    } | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <div className='bg-purple-600/40 w-full h-8 fixed top-0 left-0 border-b border-purple-700/30'>
        <div className='grid grid-cols-2 justify-between items-center px-4 h-full'>
            <h1 className="justify-self-start text-md font-bold text-center  text-foreground ">Oniria</h1>
                <div className="flex items-center justify-end-safe gap-3">
                {!user && 
                (
                <>
                <Link
                    href="/auth/sign-in"

                    type="button"
                    className="
                    px-4 py-1
                    rounded-full
                    text-sm font-medium
                    text-zinc-300
                    border border-white/15
                    backdrop-blur-md
                    transition-all
                    hover:border-purple-400/50
                    hover:text-purple-300
                    "
                >
                    Login
                </Link>

                <span className="text-xs text-zinc-500">or</span>

                <Link
                    href="/auth/sign-up"
                    type="button"
                    className="
                    px-5 py-1
                    rounded-full
                    text-sm font-semibold
                    text-white
                    bg-linear-to-r from-purple-500 to-indigo-500
                    shadow-lg shadow-purple-500/30
                    transition-all
                    hover:shadow-purple-500/50
                    hover:scale-[1.01]
                    active:scale-[0.97]
                    "
                >
                    Sign up
                </Link>
                </>
                )}
                {user && (
                    <UserComponent user={user} />
                )}
            </div>
        </div>
    </div>
  )
}
