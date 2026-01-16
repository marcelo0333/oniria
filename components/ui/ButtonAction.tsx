import React from 'react'
    
interface ButtonActionProps {
    children: React.ReactNode;
    mainColor?: 'indigo' | 'purple' | 'pink' | 'red' | 'yellow' | 'green' | 'emerald';
    nameAction: string;
    onClick?: () => void;
    disabled?: boolean;
    loggedIn?: boolean;
}

const colorMap = {
    indigo: 'from-indigo-800 to-indigo-600 shadow-indigo-500/70',
    purple: 'from-purple-800 to-purple-600 shadow-purple-500/70',
    red: 'from-red-800 to-red-600 shadow-red-500/70',
    emerald: 'from-emerald-800 to-emerald-600 shadow-emerald-500/70',
    yellow: 'from-yellow-800 to-yellow-600 shadow-yellow-500/70',
    pink: 'from-pink-800 to-pink-600 shadow-pink-500/70',
    green: 'from-green-800 to-green-600 shadow-green-500/70',
};

export default function ButtonAction({ children, mainColor = 'indigo', nameAction, onClick, disabled, loggedIn }: ButtonActionProps) {
    const color = colorMap[mainColor];
    const [onHover, setOnHover] = React.useState(false);
    return (
        <div 
            onMouseEnter={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)} 
            className="relative flex flex-col items-center">
            <button
            disabled={disabled }

            onClick={onClick}
            type="button"
            className={`
            cursor-pointer
            hover:bg-linear-to-tl
            hover:animate-gradient-xy
            ${color}
            px-2 py-2 rounded-full
            h-fit
            w-fit
            self-end
            hover:shadow-[0px_2px_16px_0_rgba(99,102,241,.90)]
            transition-shadow
            border-slate-500
            text-white font-medium group
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl'}

            `}>
                {children}
            </button>
            {
                onHover && (
                    <div className='absolute p-1 mt-10 rounded-md bg-black/70 text-zinc-300 text-xs'>
                        {!loggedIn && (<p className='text-sm'>Login required</p>)}
                        {loggedIn && <p className='text-sm'>{nameAction.charAt(0).toUpperCase() + nameAction.slice(1)}</p>}
                    </div>
                )
            }
        </div>
    )
}
