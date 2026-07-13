import { useMemo } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useClients } from '../../hooks/useClients';
import QuickStats from './QuickStats';
import RecentProjects from './RecentProjects';
import FinancialOverview from './FinancialOverview';

export default function Dashboard() {
  const projects = useProjectStore((s) => s.projects);
  const transactions = useTransactionStore((s) => s.transactions);
  const { clients } = useClients();

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthlyTxns = transactions.filter((t) => t.date >= monthStart);
    const income = monthlyTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthlyTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return {
      activeProjects: projects.filter((p) => p.status === 'Active').length,
      totalClients: clients.length,
      monthlyIncome: income,
      monthlyNet: income - expense,
    };
  }, [projects, transactions, clients]);

  return (
    <div className="space-y-6">
      <h2>Dashboard</h2>
      <QuickStats stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjects projects={projects} />
        <FinancialOverview transactions={transactions} />
      </div>
    </div>
  );
}
