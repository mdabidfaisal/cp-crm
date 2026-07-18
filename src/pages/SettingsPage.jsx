import GoogleLoginButton from '../components/GoogleLoginButton';
import googleDrive from '../services/googleDrive';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useClientStore } from '../store/clientStore';
import { useTransactionStore } from '../store/transactionStore';
import { useLoanStore } from '../store/loanStore';
import { useLoanPersonStore } from '../store/loanPersonStore';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const handleClearLocal = () => {
    if (confirm('Clear all local data? This will not affect Google Drive files.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleResetAll = async () => {
    if (!confirm('Delete ALL data from Google Drive and localStorage? This cannot be undone. Are you sure?')) return;
    if (!confirm('FINAL WARNING: All your projects, clients, transactions, loans will be permanently deleted. Continue?')) return;

    try {
      const folderIds = [
        localStorage.getItem('crm_main_folder_id'),
        localStorage.getItem('crm_projects_folder_id'),
        localStorage.getItem('crm_clients_folder_id'),
        localStorage.getItem('crm_transactions_folder_id'),
        localStorage.getItem('crm_templates_folder_id'),
        localStorage.getItem('crm_loans_folder_id'),
      ].filter(Boolean);

      for (const id of folderIds) {
        try {
          const files = await googleDrive.listFiles(id);
          for (const f of files) {
            try { await googleDrive.deleteFile(f.id); } catch {}
          }
          await googleDrive.deleteFile(id);
        } catch {}
      }
    } catch {}

    localStorage.clear();
    useProjectStore.setState({ projects: [] });
    useClientStore.setState({ clients: [] });
    useTransactionStore.setState({ transactions: [] });
    useLoanStore.setState({ loans: [] });
    useLoanPersonStore.setState({ persons: [] });

    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2>Settings</h2>

      <div className="card space-y-4">
        <h3 className="font-semibold">Google Drive Sync</h3>
        {user ? (
          <p className="text-sm text-gray-500">Signed in as <strong>{user.email}</strong></p>
        ) : (
          <p className="text-sm text-gray-500">Connect your Google account to sync data to Google Drive.</p>
        )}
        <GoogleLoginButton />
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold">Data</h3>
        <p className="text-sm text-gray-500">All data is synced to your Google Drive.</p>
        <div className="flex flex-col gap-2">
          <button onClick={handleClearLocal} className="btn btn-secondary text-sm">
            Clear Local Data (keeps Drive files)
          </button>
          <button onClick={handleResetAll} className="btn btn-danger text-sm">
            Reset All Data (Drive + Local) — Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
