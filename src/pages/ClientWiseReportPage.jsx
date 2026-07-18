import { useMemo, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useClients } from '../hooks/useClients';

export default function ClientWiseReportPage() {
  const projects = useProjectStore((s) => s.projects);
  const { clients } = useClients();
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const report = useMemo(() => {
    const from = filterFrom || '1970-01-01';
    const to = filterTo || today;

    return clients.map((c) => {
      const clientProjects = projects.filter((p) => p.clientId === c.id);
      const allPayments = clientProjects.flatMap((p) =>
        (p.payments || [])
          .filter((pay) => pay.date >= from && pay.date <= to)
          .map((pay) => ({ ...pay, projectName: p.name, projectBudget: p.budget || 0 }))
      );
      const totalPaid = allPayments.reduce((s, pay) => s + pay.amount, 0);
      const totalBudget = clientProjects.reduce((s, p) => s + (p.budget || 0), 0);

      return { client: c, projectCount: clientProjects.length, payments: allPayments, totalPaid, totalBudget, outstanding: totalBudget - totalPaid };
    }).filter((r) => r.projectCount > 0);
  }, [clients, projects, filterFrom, filterTo, today]);

  const grandTotalBudget = report.reduce((s, r) => s + r.totalBudget, 0);
  const grandTotalPaid = report.reduce((s, r) => s + r.totalPaid, 0);
  const grandOutstanding = report.reduce((s, r) => s + r.outstanding, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Client-Wise Payment Report</h2>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="input text-sm" />
          </div>
          {(filterFrom || filterTo) && (
            <div className="flex items-end">
              <button onClick={() => { setFilterFrom(''); setFilterTo(''); }} className="btn btn-secondary text-sm">Reset</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-xl font-bold">{report.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-xl font-bold">৳{grandTotalBudget.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-xl font-bold text-green-600">৳{grandTotalPaid.toLocaleString()}</p>
        </div>
      </div>

      {report.length === 0 ? (
        <p className="text-gray-500">No client data available.</p>
      ) : (
        report.map((r) => (
          <div key={r.client.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{r.client.name}</h3>
              <div className="flex gap-4 text-sm">
                <span>Budget: <strong>৳{r.totalBudget.toLocaleString()}</strong></span>
                <span className="text-green-600">Paid: <strong>৳{r.totalPaid.toLocaleString()}</strong></span>
                <span className={r.outstanding > 0 ? 'text-red-600' : 'text-gray-600'}>
                  Outstanding: <strong>৳{r.outstanding.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {r.payments.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Project</th>
                    <th className="pb-2">Note</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {r.payments.map((pay) => (
                    <tr key={pay.id} className="border-b last:border-0">
                      <td className="py-2">{new Date(pay.date).toLocaleDateString()}</td>
                      <td className="py-2">{pay.projectName}</td>
                      <td className="py-2 text-gray-500">{pay.note || '-'}</td>
                      <td className="py-2 text-right text-green-600 font-medium">৳{pay.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold border-t">
                    <td className="pt-2" colSpan={3}>Total</td>
                    <td className="pt-2 text-right text-green-600">৳{r.totalPaid.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="text-sm text-gray-400">No payments in this period.</p>
            )}
          </div>
        ))
      )}

      <div className="card">
        <h3 className="font-semibold mb-3">Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total Budget</p>
            <p className="text-lg font-bold">৳{grandTotalBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Paid</p>
            <p className="text-lg font-bold text-green-600">৳{grandTotalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Outstanding</p>
            <p className={`text-lg font-bold ${grandOutstanding > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              ৳{grandOutstanding.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
