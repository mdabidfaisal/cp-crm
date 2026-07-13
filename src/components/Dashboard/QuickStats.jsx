export default function QuickStats({ stats }) {
  const cards = [
    { label: 'Active Projects', value: stats.activeProjects, color: 'text-blue-600' },
    { label: 'Total Clients', value: stats.totalClients, color: 'text-purple-600' },
    { label: 'Income (MTD)', value: `৳${stats.monthlyIncome.toLocaleString()}`, color: 'text-green-600' },
    { label: 'Net (MTD)', value: `৳${stats.monthlyNet.toLocaleString()}`, color: stats.monthlyNet >= 0 ? 'text-green-600' : 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
