function SocialButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="
        flex items-center justify-center
        h-12
        rounded-xl
        bg-white/5
        border border-white/10
        backdrop-blur-md
        transition-all
        hover:bg-white/10
        hover:border-purple-400/30
      "
    >
      {children}
    </button>
  );
}
export default SocialButton;