import { useEffect, useState, useContext } from 'react';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [user]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleRemove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/cart/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(cartItems.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (loading) {
        return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="bg-gray-50 min-h-[80vh] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>
                
                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <ShoppingBag className="h-12 w-12" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Let's find your dream holiday destination now!</p>
                        <Link to="/destinations" className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 inline-block">
                            Search Destinations
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                                    <img 
                                        src={item.image_url || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'} 
                                        alt={item.name} 
                                        className="w-24 h-24 rounded-xl object-cover"
                                    />
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Booking Date: {new Date(item.booking_date).toLocaleDateString('id-ID')} <br/>
                                            {item.quantity} Tickets x Rp {parseFloat(item.price).toLocaleString('id-ID')}
                                        </p>
                                        <div className="text-lg font-bold text-blue-600 mt-2">
                                            Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemove(item.id)}
                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-6 w-6" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Total Tickets</span>
                                        <span>{cartItems.reduce((sum, i) => sum + i.quantity, 0)} tickets</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax & Service</span>
                                        <span>Rp 0</span>
                                    </div>
                                </div>
                                
                                <hr className="border-gray-100 mb-6" />
                                
                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-lg font-bold">Total Payment</span>
                                    <span className="text-2xl font-extrabold text-blue-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
                                </div>
                                
                                <Link 
                                    to="/checkout"
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                                >
                                    Proceed to Checkout
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
