function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  id,
}: {
  type?: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      id={id}
      name={name}
      className="
        w-full
        rounded-xl
        bg-white/5
        border border-white/10
        px-4 py-3
        text-sm text-zinc-200
        placeholder:text-zinc-500
        backdrop-blur-md
        transition
        focus:outline-none
        focus:border-purple-400/40
        focus:bg-white/10
      "
    />
  );
}
export default Input;