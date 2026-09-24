import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Filter } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../lib/api';

const Destinations = () => {
    const { user } = useContext(AuthContext);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Pagination & Filters state
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        sort: searchParams.get('sort') || 'newest',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || ''
    });

    useEffect(() => {
        fetchDestinations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const fetchDestinations = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(searchParams).toString();
            const res = await api.get(`/destinations?${query}`);
            setDestinations(res.data.data);
            setPagination(res.data.pagination);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load destination list");
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        const newParams = new URLSearchParams();
        if (filters.category) newParams.set('category', filters.category);
        if (filters.sort) newParams.set('sort', filters.sort);
        if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
        if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
        newParams.set('page', '1'); // Reset to page 1 on filter
        setSearchParams(newParams);
    };

    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('page', newPage);
            setSearchParams(newParams);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const Skeletons = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-10 bg-gray-200 rounded-xl w-1/3"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Explore Destinations</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Discover natural and cultural beauty through the best travel packages we offer.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filter */}
                <div className="w-full lg:w-1/4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                        <div className="flex items-center gap-2 font-bold text-gray-900 mb-6">
                            <Filter className="h-5 w-5" /> Search Filter
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select name="sort" value={filters.sort} onChange={handleFilterChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Lowest Price</option>
                                    <option value="price_desc">Highest Price</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">All Categories</option>
                                    <option value="Pantai">Beach</option>
                                    <option value="Gunung">Mountain</option>
                                    <option value="Budaya">Culture</option>
                                    <option value="Kota">City</option>
                                    <option value="Alam">Nature</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Price (Rp)</label>
                                <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="0" className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price (Rp)</label>
                                <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Unlimited" className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <button onClick={applyFilters} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2">
                                <Search className="h-4 w-4" /> Apply Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full lg:w-3/4">
                    {loading ? (
                        <Skeletons />
                    ) : destinations.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                            <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No destinations found</h3>
                            <p className="text-gray-500">Try changing your search filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {destinations.map(dest => (
                                    <div key={dest.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                        <div className="relative h-64 overflow-hidden">
                                            <img 
                                                src={dest.image_url ? `${dest.image_url}` : 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
                                                alt={dest.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow-sm">
                                                {dest.category}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center text-gray-500 text-sm mb-2">
                                                <MapPin className="h-4 w-4 mr-1" /> {dest.location}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{dest.name}</h3>
                                            <p className="text-gray-600 text-sm mb-6 line-clamp-2">{dest.description}</p>
                                            
                                            <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Starting from</p>
                                                    <p className="text-lg font-black text-blue-600">Rp {parseFloat(dest.price).toLocaleString('id-ID')}</p>
                                                </div>
                                                <Link 
                                                    to={`/destinations/${dest.id}`} 
                                                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-colors duration-300"
                                                >
                                                    Detail
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2">
                                    <button 
                                        onClick={() => changePage(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Previous
                                    </button>
                                    
                                    <div className="flex items-center gap-1">
                                        {[...Array(pagination.totalPages)].map((_, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => changePage(idx + 1)}
                                                className={`w-10 h-10 rounded-lg font-medium transition ${pagination.page === idx + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => changePage(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Destinations;
