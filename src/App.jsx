import { useEffect, useState } from 'react';
import GoogleLoginButton from './components/GoogleLoginButton';
import googleDrive from './services/googleDrive';
import { useAuthStore } from './store/authStore';
import { useProjectStore } from './store/projectStore';
import { useTransactionStore } from './store/transactionStore';
import { useClientStore } from './store/clientStore';
import { useLoanStore } from './store/loanStore';
import { useInvoiceStore } from './store/invoiceStore';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import ClientsPage from './pages/ClientsPage';
import TransactionsPage from './pages/TransactionsPage';
import CashbookPage from './pages/CashbookPage';
import LoanBookPage from './pages/LoanBookPage';
import InvoicesPage from './pages/InvoicesPage';
import ReportsPage from './pages/ReportsPage';
import ProfitLossPage from './pages/ProfitLossPage';
import ClientWiseReportPage from './pages/ClientWiseReportPage';
import SettingsPage from './pages/SettingsPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const { isSignedIn, setUser } = useAuthStore();
  const { loadProjects } = useProjectStore();
  const { loadTransactions } = useTransactionStore();
  const { loadClients } = useClientStore();
  const { loadLoans } = useLoanStore();
  const { loadInvoices } = useInvoiceStore();

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('google_access_token');
      const email = localStorage.getItem('user_email');
      const name = localStorage.getItem('user_name');

      if (token && email) {
        googleDrive.accessToken = token;
        try {
          await googleDrive.initializeFolderStructure();
        } catch (error) {
          console.error('Folder initialization error (will retry on next save):', error);
        }
        setUser({ email, name: name || email });
        try { await loadProjects(); } catch (e) { console.error('loadProjects:', e); }
        try { await loadTransactions(); } catch (e) { console.error('loadTransactions:', e); }
        try { await loadClients(); } catch (e) { console.error('loadClients:', e); }
        try { await loadLoans(); } catch (e) { console.error('loadLoans:', e); }
        try { await loadInvoices(); } catch (e) { console.error('loadInvoices:', e); }
      }
      setLoading(false);
    };
    initApp();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-xl text-gray-600">Loading...</p></div>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Code Prophet CRM</h1>
          <p className="text-gray-600 mb-8">Manage projects, clients, and finances in one place</p>
          <GoogleLoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/cashbook" element={<CashbookPage />} />
            <Route path="/loans" element={<LoanBookPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/profit-loss" element={<ProfitLossPage />} />
            <Route path="/reports/client-wise" element={<ClientWiseReportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
