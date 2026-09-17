import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, ShoppingCart, Tag, Star, User, MessageCircle, Calendar } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Fix leaflet marker icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DestinationDetail = () => {
    const { id } = useParams();
    const [destination, setDestination] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [bookingDate, setBookingDate] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Review form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const destRes = await axios.get(`/api/destinations/${id}`);
                
                // Parse images JSON if it exists
                let destData = destRes.data;
                if (destData.images) {
                    destData.parsedImages = typeof destData.images === 'string' ? JSON.parse(destData.images) : destData.images;
                } else if (destData.image_url) {
                    destData.parsedImages = [destData.image_url];
                } else {
                    destData.parsedImages = ['https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'];
                }

                setDestination(destData);
                
                const revRes = await axios.get(`/api/destinations/${id}/reviews`);
                setReviews(revRes.data);
                
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error("Destination not found");
                navigate('/destinations');
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id, navigate]);

    useEffect(() => {
        if (!destination || !destination.parsedImages || destination.parsedImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % destination.parsedImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [destination]);

    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login first");
            navigate('/login');
            return;
        }
        if (!bookingDate) {
            toast.error("Please select a booking date");
            return;
        }
        if (destination.stock > 0 && quantity > destination.stock) {
            toast.error(`Only ${destination.stock} tickets available`);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/cart', 
                { destination_id: id, quantity, bookingDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Successfully added to cart!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add to cart");
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to leave a review");
            return;
        }

        setSubmittingReview(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/destinations/${id}/reviews`, 
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Review submitted successfully!");
            
            // Refresh reviews
            const revRes = await axios.get(`/api/destinations/${id}/reviews`);
            setReviews(revRes.data);
            setComment('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
                <div className="h-96 bg-gray-200 rounded-3xl mb-8"></div>
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="w-full lg:w-2/3 space-y-4">
                        <div className="h-10 bg-gray-200 rounded-lg w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded-lg w-1/4"></div>
                        <div className="h-32 bg-gray-200 rounded-lg w-full mt-8"></div>
                    </div>
                    <div className="w-full lg:w-1/3">
                        <div className="h-64 bg-gray-200 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    const position = destination.latitude && destination.longitude 
        ? [parseFloat(destination.latitude), parseFloat(destination.longitude)] 
        : [-8.409518, 115.188919];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Image Carousel */}
            <div className="w-full h-[50vh] md:h-[60vh] relative overflow-hidden">
                {destination.parsedImages.map((img, index) => (
                    <img 
                        key={index}
                        src={img.startsWith('http') ? img : `${img}`} 
                        alt={`${destination.name} ${index}`} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full">
                    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
                        <div className="inline-flex items-center gap-2 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-4 shadow-lg">
                            <Tag className="h-4 w-4" /> {destination.category}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                            {destination.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-gray-200">
                            <div className="flex items-center text-lg">
                                <MapPin className="h-5 w-5 mr-2" /> {destination.location}
                            </div>
                            {destination.rating > 0 && (
                                <div className="flex items-center text-lg">
                                    <Star className="h-5 w-5 mr-2 text-yellow-400 fill-yellow-400" /> 
                                    {destination.rating.toFixed(1)} ({destination.review_count} Reviews)
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 -mt-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Column - Details, Map, Reviews */}
                    <div className="w-full lg:w-2/3 space-y-12">
                        {/* Description */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Destination</h2>
                            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                                {destination.description}
                            </p>
                        </div>

                        {/* Interactive Map */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
                            <div className="h-80 w-full rounded-2xl overflow-hidden z-0">
                                <MapContainer center={position} zoom={10} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={position}>
                                        <Popup>{destination.name}</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <MessageCircle className="h-6 w-6 text-blue-600" /> Visitor Reviews
                            </h2>
                            
                            {user ? (
                                <form onSubmit={handleSubmitReview} className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Write Your Experience</h3>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1,2,3,4,5].map(star => (
                                                <button 
                                                    key={star} 
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                >
                                                    <Star className="h-8 w-8 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                                        <textarea 
                                            rows="3" 
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="w-full border-gray-300 rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="How was your trip?"
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={submittingReview}
                                        className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-blue-50 p-6 rounded-2xl text-center mb-10">
                                    <p className="text-blue-800">Please <a href="/login" className="font-bold underline">login</a> to leave a review.</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No reviews yet for this destination.</p>
                                ) : (
                                    reviews.map(rev => (
                                        <div key={rev.id} className="border-b border-gray-100 pb-6 last:border-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                                        {rev.user_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{rev.user_name}</p>
                                                        <p className="text-xs text-gray-500">{new Date(rev.created_at).toLocaleDateString('id-ID')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                                                </div>
                                            </div>
                                            {rev.comment && <p className="text-gray-600 mt-3">{rev.comment}</p>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-8">
                            <h3 className="text-gray-500 font-medium mb-2 uppercase tracking-wide text-sm">Ticket Price</h3>
                            <div className="text-4xl font-black text-blue-600 mb-8">
                                Rp {parseFloat(destination.price).toLocaleString('id-ID')}
                                <span className="text-lg text-gray-400 font-normal"> /pax</span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Booking Date</label>
                                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-3">
                                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                        <input 
                                            type="date" 
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 font-medium"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Number of Tickets</label>
                                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-1">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-xl font-bold text-blue-600 shadow-sm hover:bg-gray-100 transition"
                                        >-</button>
                                        <input 
                                            type="number" 
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.min(destination.stock > 0 ? destination.stock : 99, Math.max(1, parseInt(e.target.value) || 1)))}
                                            className="w-full text-center font-bold text-xl bg-transparent border-none focus:ring-0"
                                            readOnly
                                        />
                                        <button 
                                            onClick={() => setQuantity(destination.stock > 0 ? Math.min(destination.stock, quantity + 1) : quantity + 1)}
                                            className="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-xl font-bold text-blue-600 shadow-sm hover:bg-gray-100 transition"
                                        >+</button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <div className="flex justify-between items-center mb-6 text-lg">
                                        <span className="font-medium text-gray-600">Total Price</span>
                                        <span className="font-bold text-gray-900">Rp {(destination.price * quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                    
                                    <button 
                                        onClick={handleAddToCart}
                                        className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 shadow-lg active:scale-95"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DestinationDetail;
