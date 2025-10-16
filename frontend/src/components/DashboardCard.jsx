export default function DashboardCard({ title, value, accent=false }) {
  return (
    <div className={`rounded-xl p-4 border ${accent? 'border-accent/50 bg-cyan-950/20':'border-gray-800 bg-gray-900/40'}`}>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}
