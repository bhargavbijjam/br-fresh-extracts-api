import {
    CheckSquare,
    ChevronRight,
    FileText,
    Grid,
    Image,
    LayoutDashboard,
    LogOut, Menu,
    MessageSquare,
    Package,
    Settings,
    ShoppingCart,
    TrendingDown,
    Users,
} from 'lucide-react';
import { Component, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

class AdminErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
          <p className="text-2xl">⚠️</p>
          <p className="font-semibold text-forest-700">Something went wrong</p>
          <p className="text-sm text-warm-brown/60">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 px-4 py-2 bg-terra-500 text-white rounded-lg text-sm hover:bg-terra-600 transition-colors"
          >Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const navItems = [
  { to: '/admin',              label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/orders',       label: 'Orders',       icon: ShoppingCart },
  { to: '/admin/customers',    label: 'Customers',    icon: Users },
  { to: '/admin/expenses',     label: 'Expenses',     icon: TrendingDown },
  { to: '/admin/hero',         label: 'Hero Section', icon: Image },
  { to: '/admin/categories',   label: 'Categories',   icon: Grid },
  { to: '/admin/products',     label: 'Products',     icon: Package },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { to: '/admin/why-us',        label: 'Why Us',        icon: CheckSquare },
  { to: '/admin/privacy-policy', label: 'Privacy Policy', icon: FileText },
  { to: '/admin/settings',      label: 'Settings',       icon: Settings },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  if (!user) { navigate('/login'); return null; }
  if (!isAdmin) { navigate('/'); return null; }

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <aside className={`bg-white border-r border-sand-200 flex flex-col h-full`}>
      {/* Logo area */}
      <div className="px-6 py-5 border-b border-sand-100 flex items-center gap-2">
        <img src="https://res.cloudinary.com/djmrm8sgh/image/upload/v1776526884/Untitled_design-removebg-preview_obbk20.png" alt="BR Fresh Extracts" className="h-7 w-7 object-contain" />
        <div>
          <p className="font-serif text-base text-forest-700 font-semibold">BR Fresh Extracts</p>
          <p className="text-xs text-warm-brown/50">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setSideOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-terra-50 text-terra-600 border border-terra-100'
                  : 'text-warm-brown hover:bg-ivory hover:text-forest-700'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-terra-500' : 'text-warm-brown/50'} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-terra-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-sand-100">
        <div className="flex items-center gap-2 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-terra-100 flex items-center justify-center text-terra-600 text-xs font-semibold">
            {user.name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-forest-700 truncate">{user.name}</p>
            <p className="text-xs text-warm-brown/50 truncate">{user.email || user.phone}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-warm-brown hover:bg-red-50 hover:text-red-500 transition-colors">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 xl:w-64 shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSideOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden flex flex-col">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-sand-200 px-6 py-3.5 flex items-center gap-3 shrink-0">
          <button onClick={() => setSideOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-ivory">
            <Menu size={20} className="text-warm-brown" />
          </button>
          <h1 className="font-sans text-sm font-medium text-warm-brown/60">
            Admin <span className="text-terra-500">›</span> BR Fresh Extracts
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/" className="text-xs text-warm-brown/50 hover:text-terra-500 transition-colors">
              View Site →
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
