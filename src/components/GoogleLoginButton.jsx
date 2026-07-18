import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

export default function GoogleLoginButton() {
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const check = () => {
      if (window.google?.accounts?.oauth2) {
        setReady(true);
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  }, []);

  const handleLogin = () => {
    if (!window.google?.accounts?.oauth2) return;
    setBusy(true);
    window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: async (response) => {
        if (response.access_token) {
          localStorage.setItem('google_access_token', response.access_token);
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });
            const userInfo = await res.json();
            localStorage.setItem('user_email', userInfo.email || '');
            localStorage.setItem('user_name', userInfo.name || userInfo.email || '');
          } catch (_) {}
          window.location.reload();
        } else {
          setBusy(false);
        }
      },
      error_callback: () => setBusy(false),
    }).requestAccessToken();
  };

  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    setUser(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button onClick={handleLogout} className="btn btn-danger text-sm">Logout</button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} disabled={!ready || busy} className="btn-primary disabled:bg-gray-400">
      {!ready ? 'Loading...' : busy ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}
