export default function ClientStats({ totalClients, activeProjects, totalRevenue }) {
  const cards = [
    { label: 'Total Clients', value: totalClients, color: 'text-purple-600' },
    { label: 'Active Projects', value: activeProjects, color: 'text-blue-600' },
    { label: 'Total Revenue', value: `৳${(totalRevenue || 0).toLocaleString()}`, color: 'text-green-600' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="card">
          <p className="text-sm text-gray-500">{c.label}</p>
          <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
