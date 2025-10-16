export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-gray-900/60 border-b border-gray-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
          <span className="font-semibold text-accent">FinAura</span>
        </div>
        <nav className="text-sm text-gray-300">
          Your AI-Powered Path to Smarter Money
        </nav>
      </div>
    </header>
  )
}
