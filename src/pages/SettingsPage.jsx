import GoogleLoginButton from '../components/GoogleLoginButton';
import { useAuthStore } from '../store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();

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
        <button
          onClick={() => {
            if (confirm('Clear all local data? This will not affect Google Drive files.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="btn btn-secondary text-sm text-red-600"
        >
          Clear Local Data
        </button>
      </div>
    </div>
  );
}
