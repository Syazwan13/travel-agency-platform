import React, { useState, useEffect } from 'react';
import api from '../../utils/apiConfig';

const getProviderApiBase = (user) => {
  if (!user || user.role !== 'travel_agency') return null;
  if (user.companyName?.toLowerCase().includes('amitravel') || user.name?.toLowerCase().includes('amitravel')) {
    return '/api/packages/amitravel';
  }
  if (user.companyName?.toLowerCase().includes('holidaygogo') || user.name?.toLowerCase().includes('holidaygogo')) {
    return '/api/packages/holidaygogogo';
  }
  return null;
};

const PackageFormModal = ({ open, onClose, packageData, providerContactId, user }) => {
  const [form, setForm] = useState(packageData || { title: '', description: '', price: '', image: '', link: '', destination: '', resort: '', features: [], includes: [], excludes: [] });
  const [loading, setLoading] = useState(false);
  const isEdit = !!packageData;

  useEffect(() => {
    setForm(packageData || { title: '', description: '', price: '', image: '', link: '', destination: '', resort: '', features: [], includes: [], excludes: [] });
  }, [packageData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    const requiredFields = ['title', 'price', 'resort', 'destination'];
    for (const field of requiredFields) {
      if (!form[field] || form[field].trim() === '') {
        alert(`Field '${field}' is required.`);
        return;
      }
    }
    setLoading(true);
    try {
      const apiBase = getProviderApiBase(user);
      if (!apiBase) throw new Error('Unknown provider');
      let response;
      if (isEdit) {
        response = await api.put(`${apiBase}/${packageData._id}`, { ...form, provider: providerContactId });
              } else {
          response = await api.post(`${apiBase}`, { ...form, provider: providerContactId });
      }
      if (response.data && response.data.success) {
        onClose();
      } else {
        alert('Failed to save package');
      }
    } catch (err) {
      alert('Failed to save package');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Package' : 'Add Package'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full border p-2 rounded" required />
          <input name="resort" value={form.resort} onChange={handleChange} placeholder="Resort" className="w-full border p-2 rounded" required />
          <input name="destination" value={form.destination} onChange={handleChange} placeholder="Destination" className="w-full border p-2 rounded" required />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="w-full border p-2 rounded" required />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" />
          <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="w-full border p-2 rounded" />
          <input name="link" value={form.link} onChange={handleChange} placeholder="Link" className="w-full border p-2 rounded" />
          {/* Add more fields as needed */}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageFormModal; 