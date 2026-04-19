import {
    ChevronDown,
    ChevronUp,
    Loader2,
    MapPin,
    Phone,
    RefreshCw,
    Search,
    ShoppingBag,
    User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const API_URL = (() => {
    const u = import.meta.env.VITE_API_URL || '/api/';
    return u.endsWith('/') ? u : u + '/';
})();
const UPLOAD_SECRET = import.meta.env.VITE_UPLOAD_SECRET || '';

const STATUS_COLORS = {
    Pending:   'bg-amber-50 text-amber-700 border-amber-200',
    Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    Packed:    'bg-purple-50 text-purple-700 border-purple-200',
    Shipped:   'bg-indigo-50 text-indigo-700 border-indigo-200',
    Delivered: 'bg-green-50 text-green-700 border-green-200',
    Cancelled: 'bg-red-50 text-red-600 border-red-200',
};

function fmt(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function fmtDateTime(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function OrderCard({ order }) {
    const statusClass = STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600 border-gray-200';
    return (
        <div className="border border-sand-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                    <p className="text-xs text-warm-brown/50 font-mono">#{String(order.id).slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-warm-brown/60 mt-0.5">{fmtDateTime(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
                        {order.status}
                    </span>
                    <span className="text-xs text-warm-brown/60 border border-sand-200 rounded-full px-2 py-0.5">
                        {order.payment_mode}
                    </span>
                    <span className="text-sm font-semibold text-forest-700">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
            </div>
            {(order.items || []).length > 0 && (
                <div className="mt-3 space-y-1">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs text-warm-brown/80">
                            <span>{item.product || item.name}{item.weight ? ` (${item.weight})` : ''} × {item.quantity}</span>
                            <span>₹{Number(item.price_at_time).toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
            )}
            {order.customer?.address && (
                <div className="mt-2 flex items-start gap-1 text-xs text-warm-brown/50">
                    <MapPin size={11} className="mt-0.5 shrink-0" />
                    <span>{[order.customer.address, order.customer.city, order.customer.state, order.customer.pincode].filter(Boolean).join(', ')}</span>
                </div>
            )}
        </div>
    );
}

function CustomerRow({ customer }) {
    const [expanded, setExpanded] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [fetched, setFetched] = useState(false);

    const toggle = async () => {
        if (!expanded && !fetched) {
            setLoadingOrders(true);
            try {
                const phone = encodeURIComponent(customer.phone);
                const res = await fetch(`${API_URL}admin/customers/${phone}/orders/`, {
                    headers: UPLOAD_SECRET ? { 'X-Upload-Secret': UPLOAD_SECRET } : {},
                });
                if (res.ok) setOrders(await res.json());
            } catch { /* non-critical */ }
            setFetched(true);
            setLoadingOrders(false);
        }
        setExpanded(v => !v);
    };

    const statusEntries = Object.entries(customer.statusBreakdown || {});

    return (
        <div className="border border-sand-200 rounded-xl bg-white overflow-hidden">
            <button
                onClick={toggle}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-ivory transition-colors"
            >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-terra-100 flex items-center justify-center text-terra-600 font-semibold text-sm shrink-0">
                    {(customer.name || '?')[0].toUpperCase()}
                </div>

                {/* Name + phone + address */}
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-forest-700 text-sm truncate">{customer.name || 'Unknown'}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-warm-brown/60">
                            <Phone size={10} /> {customer.phone}
                        </span>
                        {customer.address && (
                            <span className="flex items-center gap-1 text-xs text-warm-brown/50 truncate max-w-xs">
                                <MapPin size={10} /> {customer.address}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
                    <div>
                        <p className="text-xs text-warm-brown/50">Orders</p>
                        <p className="text-sm font-semibold text-forest-700">{customer.totalOrders}</p>
                    </div>
                    <div>
                        <p className="text-xs text-warm-brown/50">Total Spent</p>
                        <p className="text-sm font-semibold text-terra-600">₹{Number(customer.totalSpent).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-warm-brown/50">Last Order</p>
                        <p className="text-sm text-warm-brown/70">{fmt(customer.lastOrderDate)}</p>
                    </div>
                </div>

                {/* Expand icon */}
                <div className="shrink-0 text-warm-brown/40">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {/* Mobile stats row */}
            <div className="sm:hidden flex items-center gap-4 px-5 pb-3 text-xs text-warm-brown/60 border-t border-sand-100">
                <span><span className="font-semibold text-forest-700">{customer.totalOrders}</span> orders</span>
                <span><span className="font-semibold text-terra-600">₹{Number(customer.totalSpent).toLocaleString('en-IN')}</span> spent</span>
                <span>Last: {fmt(customer.lastOrderDate)}</span>
            </div>

            {/* Status breakdown chips */}
            {statusEntries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-5 pb-3">
                    {statusEntries.map(([status, count]) => (
                        <span key={status} className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {status}: {count}
                        </span>
                    ))}
                </div>
            )}

            {/* Orders drilldown */}
            {expanded && (
                <div className="border-t border-sand-200 bg-ivory px-5 py-4 space-y-3">
                    {loadingOrders ? (
                        <div className="flex items-center gap-2 text-sm text-warm-brown/50">
                            <Loader2 size={15} className="animate-spin" /> Loading orders…
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-sm text-warm-brown/50">No orders found.</p>
                    ) : (
                        orders.map(order => <OrderCard key={order.id} order={order} />)
                    )}
                </div>
            )}
        </div>
    );
}

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}admin/customers/`, {
                headers: UPLOAD_SECRET ? { 'X-Upload-Secret': UPLOAD_SECRET } : {},
            });
            if (res.ok) setCustomers(await res.json());
        } catch { /* non-critical */ }
        setLoading(false);
    };

    useEffect(() => { fetchCustomers(); }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return customers;
        const q = search.trim().toLowerCase();
        return customers.filter(c =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.phone || '').includes(q) ||
            (c.email || '').toLowerCase().includes(q)
        );
    }, [customers, search]);

    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
    const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                    <h2 className="font-serif text-2xl text-forest-700">Customers</h2>
                    <p className="text-sm text-warm-brown/60 mt-0.5">
                        All customers who have placed orders
                    </p>
                </div>
                <button
                    onClick={fetchCustomers}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-sand-200 text-sm text-warm-brown hover:bg-ivory transition-colors"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total Customers', value: totalCustomers, icon: User, color: 'text-terra-600 bg-terra-50' },
                    { label: 'Total Orders',    value: totalOrders,   icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: ShoppingBag, color: 'text-forest-600 bg-forest-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white border border-sand-200 rounded-xl p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                            <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-warm-brown/50 truncate">{label}</p>
                            <p className="font-semibold text-forest-700 text-sm">{loading ? '—' : value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-brown/40" />
                <input
                    type="text"
                    placeholder="Search by name, phone or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sand-200 bg-white text-sm text-warm-brown placeholder:text-warm-brown/40 focus:outline-none focus:ring-2 focus:ring-terra-300"
                />
            </div>

            {/* Customer list */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-warm-brown/40">
                    <Loader2 size={24} className="animate-spin mr-2" /> Loading customers…
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-warm-brown/40">
                    <User size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">{search ? 'No customers match your search.' : 'No customers yet.'}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-warm-brown/50 mb-2">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</p>
                    {filtered.map(customer => (
                        <CustomerRow key={customer.phone} customer={customer} />
                    ))}
                </div>
            )}
        </div>
    );
}
