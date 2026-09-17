import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Trash2, Plus, X } from 'lucide-react';

const ManageAdmins = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'admin'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter to show only admins and superadmins
            setUsers(res.data.filter(u => u.role !== 'user'));
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to revoke this admin's rights? (User will be deleted)")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/users', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'admin' });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create admin');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Privileged Users</h1>
                    <p className="text-gray-500 text-sm">Super Admin specific page</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg active:scale-95 transition flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" /> Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered Since</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{u.name}</div>
                                    <div className="text-sm text-gray-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                        <Shield className="h-3 w-3 mr-1 self-center" /> {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(u.created_at).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {u.role !== 'superadmin' && (
                                        <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                        
                        <div className="p-8">
                            <h2 className="text-2xl font-bold mb-6">Add New Admin</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input required type="email" className="w-full border rounded-lg px-3 py-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                                    <input required type="password" className="w-full border rounded-lg px-3 py-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                        <option value="admin">Admin</option>
                                        <option value="owner">Destination Owner</option>
                                    </select>
                                </div>
                                
                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition">Create Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAdmins;
