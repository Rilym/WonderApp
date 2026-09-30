import React, { useEffect, useState, useRef } from 'react';

import { Plus, Edit2, Trash2, X, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../lib/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position ? <Marker position={position} /> : null;
};

const ManageDestinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        id: null, name: '', description: '', price: '', category: '', location: '', stock: '', latitude: '', longitude: ''
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/admin/destinations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDestinations(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImageFiles(files);
            setImagePreviews(files.map(file => URL.createObjectURL(file)));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            setImageFiles(imageFiles);
            setImagePreviews(imageFiles.map(file => URL.createObjectURL(file)));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const data = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key !== 'id') data.append(key, formData[key]);
        });
        imageFiles.forEach(file => {
            data.append('images', file);
        });

        try {
            if (formData.id) {
                await api.put(`/destinations/${formData.id}`, data, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/destinations', data, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            }
            toast.success(formData.id ? 'Destination updated!' : 'Destination added!');
            setIsModalOpen(false);
            resetForm();
            fetchDestinations();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save destination');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this destination?')) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/destinations/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Destination deleted successfully');
            fetchDestinations();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete destination');
        }
    };

    const openEditModal = (dest) => {
        setFormData(dest);
        
        let previews = [];
        if (dest.images) {
            const parsed = typeof dest.images === 'string' ? JSON.parse(dest.images) : dest.images;
            previews = parsed.map(img => `https://wonderapp.onrender.com${img}`);
        } else if (dest.image_url) {
            previews = [`https://wonderapp.onrender.com${dest.image_url}`];
        }
        
        setImagePreviews(previews);
        setImageFiles([]);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ id: null, name: '', description: '', price: '', category: '', location: '', stock: '', latitude: '', longitude: '' });
        setImageFiles([]);
        setImagePreviews([]);
    };

    if (loading) return <div>Loading...</div>;

    const categories = ["Beach", "Mountain", "City", "Historical", "Nature", "Other"];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Destinations</h1>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" /> Add New
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {destinations.map(dest => (
                            <tr key={dest.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <img className="h-10 w-10 rounded-lg object-cover" src={dest.image_url ? `https://wonderapp.onrender.com${dest.image_url}` : 'https://via.placeholder.com/150'} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{dest.name}</div>
                                            <div className="text-sm text-gray-500">{dest.location}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dest.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rp {parseFloat(dest.price).toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEditModal(dest)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit2 className="h-5 w-5 inline" /></button>
                                    <button onClick={() => handleDelete(dest.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5 inline" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl relative my-8">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                        
                        <div className="p-8">
                            <h2 className="text-2xl font-bold mb-6">{formData.id ? 'Edit Destination' : 'Add New Destination'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination Name</label>
                                        <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select required className="w-full border rounded-lg px-3 py-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                            <option value="">Select a category</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rp)</label>
                                        <input required type="number" className="w-full border rounded-lg px-3 py-2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                        <input type="number" step="any" className="w-full border rounded-lg px-3 py-2" value={formData.latitude || ''} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="e.g. -8.409518" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                        <input type="number" step="any" className="w-full border rounded-lg px-3 py-2" value={formData.longitude || ''} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="e.g. 115.188919" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pick Location on Map (Click to set Latitude & Longitude)</label>
                                    <div className="h-64 w-full rounded-2xl overflow-hidden z-0 border border-gray-200">
                                        <MapContainer 
                                            center={(formData.latitude && formData.longitude) ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] : [-8.409518, 115.188919]} 
                                            zoom={10} 
                                            scrollWheelZoom={true} 
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <LocationPicker 
                                                position={(formData.latitude && formData.longitude) ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] : [-8.409518, 115.188919]} 
                                                setPosition={(pos) => setFormData({...formData, latitude: pos[0].toFixed(6), longitude: pos[1].toFixed(6)})} 
                                            />
                                        </MapContainer>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea required rows="3" className="w-full border rounded-lg px-3 py-2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>

                                {/* Drag & Drop Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination Images (up to 5)</label>
                                    
                                    {/* Area Drop */}
                                    <div 
                                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition cursor-pointer relative overflow-hidden ${imagePreviews.length > 0 ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:bg-gray-50'}`}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        onClick={(e) => {
                                            // Jangan memicu klik input jika yang diklik adalah tombol Hapus (X) atau gambar
                                            if(e.target.tagName !== 'BUTTON' && e.target.tagName !== 'IMG' && !e.target.closest('button')) {
                                                fileInputRef.current?.click();
                                            }
                                        }}
                                    >
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
                                        
                                        {imagePreviews.length > 0 ? (
                                            <div className="flex flex-wrap gap-4 w-full p-2 justify-center">
                                                {imagePreviews.map((preview, i) => (
                                                    <div key={i} className="relative group w-24 h-24">
                                                        {/* Gambar Utama (Bisa Diklik untuk Preview) */}
                                                        <img 
                                                            src={preview} 
                                                            alt={`Preview ${i}`} 
                                                            onClick={() => window.open(preview, '_blank')} // Buka gambar di tab baru sebagai preview
                                                            className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-200 cursor-zoom-in group-hover:opacity-75 transition-opacity" 
                                                        />
                                                        
                                                        {/* Tombol Hapus (Muncul saat Hover) */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Mencegah klik menyebar ke area Drop
                                                                
                                                                // Logika Menghapus Gambar dari State
                                                                const newPreviews = [...imagePreviews];
                                                                newPreviews.splice(i, 1);
                                                                setImagePreviews(newPreviews);
                                                                
                                                                // Jika ini adalah file baru (belum di-upload), hapus juga dari imageFiles
                                                                if (imageFiles.length > i) {
                                                                    const newFiles = [...imageFiles];
                                                                    newFiles.splice(i, 1);
                                                                    setImageFiles(newFiles);
                                                                }
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
                                                            title="Remove image"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                
                                                {/* Tombol Tambah Gambar Ekstra jika belum 5 */}
                                                {imagePreviews.length < 5 && (
                                                    <div 
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="w-24 h-24 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition cursor-pointer"
                                                    >
                                                        <Plus className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-1 text-center pointer-events-none">
                                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <span className="relative rounded-md font-medium text-blue-600">
                                                        Choose files
                                                    </span>
                                                    <p className="pl-1">or drag & drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDestinations;
