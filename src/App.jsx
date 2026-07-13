import { useEffect, useState } from 'react';
import GoogleLoginButton from './components/GoogleLoginButton';
import googleDrive from './services/googleDrive';
import { useAuthStore } from './store/authStore';
import { useProjectStore } from './store/projectStore';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import ClientsPage from './pages/ClientsPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function AppContent() {
  const [initialized, setInitialized] = useState(false);
  const { isSignedIn, setUser } = useAuthStore();
  const { loadProjects, loadClients, loadTransactions } = useProjectStore();

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('google_access_token');
      const email = localStorage.getItem('user_email');
      const name = localStorage.getItem('user_name');

      if (token && email) {
        setUser({ email, name: name || email });

        try {
          await googleDrive.initializeFolderStructure();
          await loadProjects();
          await loadClients();
          await loadTransactions();
          setInitialized(true);
        } catch (error) {
          console.error('Initialization error:', error);
        }
      }
    };
    initApp();
  }, []);

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Code Prophet CRM</h1>
          <p className="text-gray-600 mb-8">
            Manage projects, clients, and finances in one place
          </p>
          <GoogleLoginButton />
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading your data...</p>
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
            <Route path="/transactions" element={<TransactionsPage />} />
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
