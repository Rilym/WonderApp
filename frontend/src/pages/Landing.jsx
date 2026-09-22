import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Shield, Star, Clock, Compass, Users, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Landing = () => {
    const [featuredDestinations, setFeaturedDestinations] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const bgImages = [
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    ];

    useEffect(() => {
        // Fetch a few top destinations for the landing page
        const fetchDestinations = async () => {
            try {
                const res = await axios.get('/api/destinations?limit=3');
                if (res.data && res.data.data) {
                    setFeaturedDestinations(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch featured destinations", error);
            }
        };
        fetchDestinations();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [bgImages.length]);

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay and Carousel */}
                <div className="absolute inset-0 z-0">
                    {bgImages.map((img, index) => (
                        <img 
                            key={index}
                            src={img}
                            alt={`Landscape ${index}`} 
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/40"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left flex flex-col lg:flex-row items-center">
                    <div className="w-full lg:w-3/5">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
                            Explore the World <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                Create Stories.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Find your dream destinations, book tickets instantly, and enjoy endless holiday experiences at the best prices.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link 
                                to="/destinations" 
                                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Start Adventure <ArrowRight className="h-5 w-5" />
                            </Link>
                            <a 
                                href="#featured" 
                                className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                            >
                                View Popular Destinations
                            </a>
                        </div>
                    </div>
                </div>
                
                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <a href="#features" className="text-white/70 hover:text-white transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </a>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Why Choose Us</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">A Perfect Journey Starts Here</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <Compass className="h-7 w-7" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Curated Destinations</h4>
                            <p className="text-gray-600 leading-relaxed">
                                We select thousands of tourist attractions to ensure you only get the most amazing holiday experiences.
                            </p>
                        </div>
                        
                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <Clock className="h-7 w-7" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Instant Booking</h4>
                            <p className="text-gray-600 leading-relaxed">
                                No need to queue. Book your tickets in seconds and get a PDF E-Ticket directly in your email.
                            </p>
                        </div>
                        
                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <Shield className="h-7 w-7" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Safe & Reliable</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Transactions are guaranteed safe with the latest encryption technology and flexible cancellation features.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Destinations */}
            <section id="featured" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div className="max-w-2xl">
                            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Most Searched</h2>
                            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">Currently Popular Destinations</h3>
                        </div>
                        <Link to="/destinations" className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 transition">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredDestinations.length > 0 ? featuredDestinations.map(dest => (
                            <div key={dest.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => window.location.href = `/destinations/${dest.id}`}>
                                <div className="relative h-64 overflow-hidden">
                                    <img 
                                        src={dest.image_url ? `${dest.image_url}` : 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
                                        alt={dest.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center text-gray-500 text-sm mb-3">
                                        <MapPin className="h-4 w-4 mr-1 text-blue-500" /> {dest.location}
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{dest.name}</h4>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dest.description}</p>
                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <p className="text-lg font-black text-blue-600">Rp {parseFloat(dest.price).toLocaleString('id-ID')}</p>
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{dest.category}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-3 text-center py-12 text-gray-500">
                                Loading popular destinations...
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-blue-600"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready for Your Next Holiday?</h2>
                    <p className="text-blue-100 text-lg md:text-xl mb-10 leading-relaxed">
                        Join thousands of other adventurers. Register now and get the ease of planning unforgettable trips.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                            Create Free Account
                        </Link>
                        <Link to="/destinations" className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-blue-500">
                            Search Destinations
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Landing;
