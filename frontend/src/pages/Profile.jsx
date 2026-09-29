import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Download, Package, Calendar } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

const Profile = () => {
    const { user, loading, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/orders/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching order history", error);
            toast.error("Failed to load order history");
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="bg-blue-600 px-8 py-10 text-white flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                        <p className="text-blue-100">Manage your orders and account</p>
                    </div>
                    <div className="mt-6 md:mt-0 flex items-center gap-4 bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
                        <div className="h-14 w-14 rounded-full bg-white text-blue-600 flex items-center justify-center text-xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-lg">{user.name}</p>
                            <p className="text-sm text-blue-100">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" /> Order History
            </h2>

            {orders.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
                    <p className="text-gray-500 mb-4 text-lg">You do not have any ticket orders yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="font-bold text-gray-900">Order ID: #{order.id}</p>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="text-right flex-1 sm:flex-none">
                                        <p className="text-sm text-gray-500">Total Payment</p>
                                        <p className="font-bold text-blue-600 text-lg">Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}</p>
                                    </div>
                                    <a 
                                        href={`/orders/${order.id}/pdf`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-blue-50 text-blue-600 p-3 rounded-xl hover:bg-blue-100 hover:-translate-y-1 transition shadow-sm"
                                        title="Download PDF"
                                    >
                                        <Download className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                            <div className="p-6">
                                <ul className="divide-y divide-gray-100">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                                            <img src={item.image_url ? `${item.image_url}` : 'https://via.placeholder.com/150'} alt={item.name} className="h-16 w-16 object-cover rounded-xl" />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-gray-500">
                                                    Booking: {new Date(item.booking_date).toLocaleDateString('id-ID')} <br/>
                                                    {item.quantity} Tickets x Rp {parseFloat(item.price).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Profile;
