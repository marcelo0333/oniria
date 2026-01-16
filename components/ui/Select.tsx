import { on } from "events";
import { AnimatePresence, motion } from "framer-motion";
import { tr } from "framer-motion/client";
import React from "react";

type Props = {
    id: string;
    label: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
    isOpen?: boolean;
    onToggle?: () => void;
};

export default function Select({
    options,
    onChange,
    label,
    isOpen,
    onToggle 
}: Props) {
    function handleSelect(value: string) {
        onChange(value);
        console.log("selected", value);
    }
    const [selected, setSelected] = React.useState<string>("");
    return (
        <div className="relative">
            <button
            type="button"
            onClick={onToggle}
            className="w-full rounded-2xl px-4 py-3 text-left border border-gray-300 text-gray-500 mb-2"
            >
                {selected ? (
                    <span className="text-purple-300">{selected}</span>
                ) :
                (
                    <span>{label}</span>
                )}
            </button>
            <AnimatePresence>
            {isOpen && (
                <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="
                absolute z-30  w-full
                rounded-2xl
                border border-white/10
                bg-zinc-900/80
                backdrop-blur-xl
                shadow-xl shadow-black/40
                text-zinc-100
                overflow-none
                "
                >
                    {options.map((option) =>  {
                        return (
                        <li
                        key={option?.value}
                        className="
                        cursor-pointer
                        px-4 py-3
                        transition-colors
                        hover:bg-purple-500/20
                        hover:text-purple-300"
                        onClick={() => {
                            onChange(option?.value);
                            setSelected(option?.label);
                            handleSelect("closed");
                        }}
                        >
                            {option?.label}
                        </li>
                    )})}
                </motion.ul>
            )}
            </AnimatePresence>
        </div>
    );
}