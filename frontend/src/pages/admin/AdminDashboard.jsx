import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ revenue: 0, ticketsSold: 0, totalDestinations: 0 });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [statsRes, ordersRes] = await Promise.all([
                    axios.get('/api/admin/stats', config),
                    axios.get('/api/admin/orders', config)
                ]);

                setStats(statsRes.data);
                setOrders(ordersRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
                <p className="text-gray-500">You are logged in as <span className="font-semibold text-blue-600 capitalize">{user.role}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition hover:shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">Rp {parseFloat(stats.revenue || 0).toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition hover:shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Tickets Sold</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.ticketsSold || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition hover:shadow-md">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Total Destinations</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalDestinations || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue per Destination</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.breakdown && stats.breakdown.length > 0 ? stats.breakdown.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.tickets || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 text-right">Rp {parseFloat(item.revenue || 0).toLocaleString('id-ID')}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.length > 0 ? orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">#{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.user_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No orders yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
