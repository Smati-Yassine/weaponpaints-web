import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSteamLogin = () => {
    window.location.href = authApi.getSteamLoginUrl();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              CS2 WeaponPaints
            </h1>
            <p className="text-gray-400">
              Customize your in-game cosmetics
            </p>
          </div>

          {/* Steam Login Button */}
          <button
            onClick={handleSteamLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 2a8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8z"/>
            </svg>
            Sign in with Steam
          </button>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>You'll be redirected to Steam to authenticate</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl mb-1">🔫</div>
            <div className="text-white text-sm font-medium">Weapon Skins</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl mb-1">🔪</div>
            <div className="text-white text-sm font-medium">Knives</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl mb-1">🧤</div>
            <div className="text-white text-sm font-medium">Gloves</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl mb-1">👤</div>
            <div className="text-white text-sm font-medium">Agents</div>
          </div>
        </div>
      </div>
    </div>
  );
}
