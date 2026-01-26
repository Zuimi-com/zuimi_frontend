export default function Header() {
  return (
    <header className="zuimi-gradient px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold">
        <span className="text-blue-400">zu</span>
        <span className="text-pink-500">i</span>
        <span className="text-purple-500">m</span>
        <span className="text-blue-300">i</span>
      </div>

      <div className="flex items-center gap-2 text-white">
        <div className="w-8 h-8 rounded-full bg-white/80" />
        <span className="text-sm">Admin</span>
      </div>
    </header>
  );
}
