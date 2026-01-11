import React from 'react'
type Props = {
    title: string;
    type: 'button' | 'submit' | 'reset';
    onClick?: () => void;
};

export default function Button(props: Props) {
    const { title, type, onClick } = props;
    return (
    <button
    type={type}
    onClick={onClick}
    className="rounded-full bg-[#7B5CFA] px-4 py-4 font-semibold text-zinc-100 hover:bg-[#6A4FF1] focus:outline-none focus:ring-2 focus:ring-[#7B5CFA] focus:ring-offset-2 dark:ring-offset-black">
        {title}
    </button>
  )
}