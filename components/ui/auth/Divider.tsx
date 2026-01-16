function Divider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-zinc-500">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}
export default Divider;