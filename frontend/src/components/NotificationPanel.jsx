export default function NotificationPanel({ items = [] }) {
  if (!items.length) return null
  return (
    <aside className="rounded-xl border border-gray-800 p-3">
      <div className="text-sm font-medium text-gray-300">Notifications</div>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((n, i) => <li key={i} className="text-gray-400">• {n}</li>)}
      </ul>
    </aside>
  )
}
