import { useAuthStore } from '../store/authStore';
import GoogleLoginButton from './GoogleLoginButton';

export default function Navbar() {
  const { user, isSignedIn } = useAuthStore();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0">
      <p className="text-sm text-gray-500">
        {isSignedIn ? `Welcome, ${user?.name || 'User'}` : ''}
      </p>
      <div className="flex items-center gap-3">
        {isSignedIn && <GoogleLoginButton />}
      </div>
    </header>
  );
}
