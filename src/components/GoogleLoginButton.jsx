import { useEffect, useState } from 'react';
import googleDrive from '../services/googleDrive';
import { useAuthStore } from '../store/authStore';

export default function GoogleLoginButton() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setUser, user } = useAuthStore();

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

  const handleLogin = async () => {
    try {
      if (!isInitialized) {
        await googleDrive.initTokenClient();
        setIsInitialized(true);
      }
      const userData = await googleDrive.requestAccessToken();
      setUser({ email: userData.email, name: userData.name || userData.email });
    } catch (error) {
      console.error('Login error:', error);
    }
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
