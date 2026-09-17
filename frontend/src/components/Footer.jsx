import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    
                    {/* Brand & Description */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 text-white">
                            <span className="font-extrabold text-2xl tracking-tight">Wonder<span className="text-blue-500">App</span></span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed">
                            The best tourist ticket booking platform in Indonesia. We offer convenience, security, and comfort for every holiday travel plan.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="#" className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                            </a>
                            <a href="#" className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Explore</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-gray-400 hover:text-blue-500 transition-colors">Home</Link></li>
                            <li><Link to="/destinations" className="text-gray-400 hover:text-blue-500 transition-colors">Tourist Destinations</Link></li>
                            <li><Link to="/about-us" className="text-gray-400 hover:text-blue-500 transition-colors">About Us</Link></li>
                            <li><Link to="/blog" className="text-gray-400 hover:text-blue-500 transition-colors">Blog & Articles</Link></li>
                            <li><Link to="/contact-us" className="text-gray-400 hover:text-blue-500 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Support & Legal</h4>
                        <ul className="space-y-4">
                            <li><Link to="/faq" className="text-gray-400 hover:text-blue-500 transition-colors">Help Center (FAQ)</Link></li>
                            <li><Link to="/how-to-order" className="text-gray-400 hover:text-blue-500 transition-colors">How to Order</Link></li>
                            <li><Link to="/terms" className="text-gray-400 hover:text-blue-500 transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="text-gray-400 hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/refund" className="text-gray-400 hover:text-blue-500 transition-colors">Refund Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter & Contact */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Stay Connected</h4>
                        <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest promos and destinations.</p>
                        <form className="flex mb-6" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className="bg-gray-800 text-white px-4 py-3 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500"
                                required
                            />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-r-lg transition-colors flex items-center justify-center">
                                <ArrowRight className="h-5 w-5 text-white" />
                            </button>
                        </form>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Phone className="h-5 w-5 text-blue-500" />
                                <span>+62 812 3456 7890</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Mail className="h-5 w-5 text-blue-500" />
                                <span>hello@wonderapp.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} WonderApp. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">Secure Payment:</span>
                        <div className="flex gap-2">
                            <div className="h-8 w-12 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-400">VISA</div>
                            <div className="h-8 w-12 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-400">MC</div>
                            <div className="h-8 w-12 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-400">QRIS</div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
