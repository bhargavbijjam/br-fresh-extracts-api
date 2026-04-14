import { ArrowRight, CheckSquare, Grid, Image, MessageSquare, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';

const cards = [
  { label: 'Hero Section', to: '/admin/hero',         icon: Image,         color: 'bg-terra-50 text-terra-500 border-terra-100' },
  { label: 'Categories',   to: '/admin/categories',   icon: Grid,          color: 'bg-forest-50 text-forest-600 border-forest-100' },
  { label: 'Products',     to: '/admin/products',     icon: Package,       color: 'bg-sand-100 text-warm-brown border-sand-200' },
  { label: 'Testimonials', to: '/admin/testimonials', icon: MessageSquare, color: 'bg-terra-50 text-terra-500 border-terra-100' },
  { label: 'Why Us',       to: '/admin/why-us',       icon: CheckSquare,   color: 'bg-forest-50 text-forest-600 border-forest-100' },
];

export default function AdminDashboard() {
  const { store } = useStore();
  const { user } = useAuth();

  const stats = [
    { label: 'Products',     value: store.products.length },
    { label: 'Categories',   value: store.categories.length },
    { label: 'Testimonials', value: store.testimonials.length },
    { label: 'Why Us Items', value: store.whyUs.length },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-forest-700 mb-1">Good day, {user?.name} 👋</h1>
        <p className="text-sm text-warm-brown/60">Here's an overview of your store content.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="admin-card text-center">
            <p className="font-serif text-3xl text-terra-500 font-semibold">{s.value}</p>
            <p className="text-xs text-warm-brown/60 mt-1 font-sans">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <h2 className="font-serif text-lg text-forest-700 mb-4">Manage Sections</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, to, icon: Icon, color }) => (
          <Link key={to} to={to}
            className="admin-card flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${color}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-forest-700 text-sm">{label}</p>
              <p className="text-xs text-warm-brown/50">Edit content →</p>
            </div>
            <ArrowRight size={15} className="text-warm-brown/25 group-hover:text-terra-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
