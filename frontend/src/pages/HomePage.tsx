import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function HomePage() {
  const { user } = useAuthStore();

  const categories = [
    {
      title: 'Weapon Skins',
      description: 'Customize your weapon skins with paint, wear, seed, and StatTrak',
      icon: '🔫',
      path: '/weapons',
      color: 'from-blue-600 to-blue-700',
    },
    {
      title: 'Knives',
      description: 'Select your knife model for each team',
      icon: '🔪',
      path: '/knives',
      color: 'from-red-600 to-red-700',
    },
    {
      title: 'Gloves',
      description: 'Choose glove models for T and CT sides',
      icon: '🧤',
      path: '/gloves',
      color: 'from-purple-600 to-purple-700',
    },
    {
      title: 'Agents',
      description: 'Pick your player models for both teams',
      icon: '👤',
      path: '/agents',
      color: 'from-green-600 to-green-700',
    },
    {
      title: 'Music Kits',
      description: 'Select your MVP music for each team',
      icon: '🎵',
      path: '/music',
      color: 'from-yellow-600 to-yellow-700',
    },
    {
      title: 'Pins',
      description: 'Display your favorite pins per team',
      icon: '📌',
      path: '/pins',
      color: 'from-pink-600 to-pink-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-8 border border-gray-600">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.displayName}!
        </h1>
        <p className="text-gray-300">
          Customize your CS2 in-game cosmetics. Changes will be applied when you join the server.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.path}
            to={category.path}
            className="group bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${category.color}`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {category.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Quick Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Steam ID</div>
            <div className="text-white font-mono text-sm">{user?.steamId}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Server</div>
            <div className="text-white font-medium">CS2 WeaponPaints</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Status</div>
            <div className="text-green-400 font-medium">✓ Connected</div>
          </div>
        </div>
      </div>
    </div>
  );
}
