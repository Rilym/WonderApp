import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Map, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const { user, loading, logout } = useContext(AuthContext);

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    
    if (!user || !['admin', 'superadmin', 'owner'].includes(user.role)) {
        return <Navigate to="/" />;
    }

    const navLinkClasses = ({ isActive }) => 
        `flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition ${
            isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
        }`;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col hidden md:flex">
                <div className="p-4 flex-grow">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Admin Menu</h2>
                    <nav className="space-y-2">
                        <NavLink to="/admin" end className={navLinkClasses}>
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                        </NavLink>
                        
                        <NavLink to="/admin/destinations" className={navLinkClasses}>
                            <Map className="h-5 w-5" />
                            Manage Destinations
                        </NavLink>
                        
                        {user.role === 'superadmin' && (
                            <NavLink to="/admin/users" className={navLinkClasses}>
                                <Users className="h-5 w-5" />
                                Manage Admins
                            </NavLink>
                        )}
                    </nav>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                    <button 
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
