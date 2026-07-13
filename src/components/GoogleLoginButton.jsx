import { useEffect, useState, useRef } from 'react';
import googleDrive from '../services/googleDrive';
import { useAuthStore } from '../store/authStore';

export default function GoogleLoginButton() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setUser, user } = useAuthStore();
  const tokenClientRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        await googleDrive.initTokenClient();
        setIsInitialized(true);
        const token = localStorage.getItem('google_access_token');
        const email = localStorage.getItem('user_email');
        const name = localStorage.getItem('user_name');
        if (token && email) {
          setUser({ email, name: name || email });
        }
      } catch (error) {
        console.error('Google initialization error:', error);
      }
    };
    init();
  }, []);

  const handleLogin = () => {
    if (!window.google?.accounts?.oauth2) return;

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response) => {
        if (response.access_token) {
          localStorage.setItem('google_access_token', response.access_token);
          googleDrive.accessToken = response.access_token;

          const payload = JSON.parse(atob(response.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          const email = payload.email || localStorage.getItem('user_email') || '';
          const name = payload.name || email;
          localStorage.setItem('user_email', email);
          localStorage.setItem('user_name', name);
          setUser({ email, name });
        }
      },
    });

    client.requestAccessToken();
  };

  const handleLogout = () => {
    googleDrive.logout();
    setUser(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button onClick={handleLogout} className="btn btn-danger text-sm">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={!isInitialized}
      className="btn-primary disabled:bg-gray-400"
    >
      {isInitialized ? 'Sign in with Google' : 'Initializing...'}
    </button>
  );
}
