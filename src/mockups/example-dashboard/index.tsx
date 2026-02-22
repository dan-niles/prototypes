import { LayoutDashboard, Users, ShoppingCart, TrendingUp, Bell, Settings, Search, MoreHorizontal } from 'lucide-react'

const stats = [
    { label: 'Total Revenue', value: '$48,295', change: '+12.5%', up: true },
    { label: 'Active Users', value: '3,842', change: '+4.1%', up: true },
    { label: 'Orders', value: '1,209', change: '-2.3%', up: false },
    { label: 'Conversion', value: '3.6%', change: '+0.8%', up: true },
]

const recentOrders = [
    { id: '#4521', customer: 'Alice Johnson', amount: '$124.00', status: 'Paid' },
    { id: '#4520', customer: 'Bob Martinez', amount: '$89.50', status: 'Pending' },
    { id: '#4519', customer: 'Carol White', amount: '$340.00', status: 'Paid' },
    { id: '#4518', customer: 'David Lee', amount: '$56.25', status: 'Cancelled' },
    { id: '#4517', customer: 'Eva Chen', amount: '$210.00', status: 'Paid' },
]

const statusColor: Record<string, string> = {
    Paid: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Cancelled: 'bg-red-100 text-red-700',
}

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Users, label: 'Users', active: false },
    { icon: ShoppingCart, label: 'Orders', active: false },
    { icon: TrendingUp, label: 'Analytics', active: false },
    { icon: Settings, label: 'Settings', active: false },
]

export default function ExampleDashboard() {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
                <div className="px-5 py-4 border-b border-gray-100">
                    <span className="font-bold text-gray-900 text-lg">Acme Inc.</span>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-0.5">
                    {navItems.map(({ icon: Icon, label, active }) => (
                        <button
                            key={label}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </nav>
                <div className="px-3 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            D
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Dan</p>
                            <p className="text-xs text-gray-400 truncate">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-auto">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1 max-w-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder:text-gray-400"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-6 py-6 space-y-6">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-400">Welcome back, Dan.</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map(({ label, value, change, up }) => (
                            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                                <p className="text-xs text-gray-400 font-medium">{label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                                <p className={`text-xs font-medium mt-1 ${up ? 'text-green-600' : 'text-red-500'}`}>
                                    {change} vs last month
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Recent orders */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900 text-sm">Recent Orders</h2>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 font-medium">Order ID</th>
                                    <th className="text-left px-5 py-3 font-medium">Customer</th>
                                    <th className="text-left px-5 py-3 font-medium">Amount</th>
                                    <th className="text-left px-5 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(({ id, customer, amount, status }) => (
                                    <tr key={id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-mono text-gray-500">{id}</td>
                                        <td className="px-5 py-3 text-gray-900">{customer}</td>
                                        <td className="px-5 py-3 text-gray-900">{amount}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[status]}`}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    )
}
