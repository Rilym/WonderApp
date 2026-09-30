import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const Checkout = () => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/login');
        else fetchCart();
    }, [user, navigate]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(res.data);
            const sum = res.data.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            setTotal(sum);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/orders/checkout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrderId(res.data.orderId);
            toast.success('Payment Successful! Check your email for the E-Ticket.', { duration: 5000 });
        } catch (error) {
            console.error(error);
            toast.error('Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    if (orderId) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center">
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-8">Thank you, your order with ID #{orderId} has been successfully processed.</p>
                    
                    <a 
                        href={`https://wonderapp.onrender.com/api/orders/${orderId}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg font-bold focus:outline-none transition-all duration-300 mb-4"
                    >
                        Download E-Ticket (PDF)
                    </a>
                    
                    <button 
                        onClick={() => navigate('/destinations')}
                        className="text-blue-600 font-medium hover:text-blue-800 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-[80vh] py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-blue-600" />
                        Checkout
                    </h1>
                    
                    <form onSubmit={handleCheckout}>
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h3>
                            <div className="space-y-4">
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="bank_transfer"
                                        checked={paymentMethod === 'bank_transfer'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 font-medium text-gray-900">Bank Transfer (BCA, Mandiri, BNI)</span>
                                </label>
                                
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'ewallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="ewallet"
                                        checked={paymentMethod === 'ewallet'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 font-medium text-gray-900">E-Wallet (GoPay, OVO, Dana)</span>
                                </label>
                                
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="credit_card"
                                        checked={paymentMethod === 'credit_card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 font-medium text-gray-900">Credit / Debit Card</span>
                                </label>
                            </div>
                        </div>

                        <hr className="border-gray-200 mb-8" />
                        
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-white font-bold text-lg transition-all duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                        >
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
