import React, { useContext, useState } from 'react';
import '../App.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Map, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);


    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="custom-font">
                        <Link to="/" onClick={() => {closeMenu(); window.scrollTo({ top:0, behavior: 'smooth'});}} className="custom-font gap-2 text-3xl font-bold text-blue-600">
                            WonderApp
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/destinations" className="text-gray-600 hover:text-blue-600 font-medium transition">Destinations</Link>
                        
                        {user ? (
                            <div className="flex items-center space-x-6 border-l pl-6">
                                <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative">
                                    <ShoppingCart className="h-6 w-6" />
                                </Link>
                                
                                <div className="flex items-center gap-4">
                                    <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                                        <div className="bg-blue-100 text-blue-600 h-8 w-8 rounded-full flex items-center justify-center font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">Login</Link>
                                <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-md">Register</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={toggleMenu} className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 bg-gray-50 rounded-lg">
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-1 shadow-lg absolute w-full">
                    <Link to="/" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Home</Link>
                    <Link to="/destinations" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Destinations</Link>
                    
                    {user ? (
                        <>
                            <Link to="/cart" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" /> Cart
                            </Link>
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <div className="px-3 py-3 flex items-center gap-2 text-gray-800 font-medium bg-gray-50 rounded-md mb-2">
                                    <User className="h-5 w-5 text-blue-600" /> {user.name}
                                </div>
                                <button 
                                    onClick={() => { handleLogout(); closeMenu(); }}
                                    className="w-full text-left flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-red-500 hover:bg-red-50 transition"
                                >
                                    <LogOut className="h-5 w-5" /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-gray-100 px-2">
                            <Link to="/login" onClick={closeMenu} className="block w-full text-center px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:-translate-y-1 hover:shadow-md active:scale-95 transition-all duration-300">Login</Link>
                            <Link to="/register" onClick={closeMenu} className="block w-full text-center px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all duration-300 shadow-md">Register</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
