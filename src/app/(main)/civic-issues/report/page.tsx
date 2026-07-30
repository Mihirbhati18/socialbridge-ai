'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ReportIssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ROAD',
    priority: 'MEDIUM',
    address: '',
    city: 'Mumbai',
    lat: '',
    lng: '',
    imageUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        });
        setLocating(false);
      },
      () => {
        alert('Unable to retrieve your location');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/civic-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lat: parseFloat(formData.lat) || 19.076,
          lng: parseFloat(formData.lng) || 72.8777
        })
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/civic-issues');
        }, 2000);
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-sm flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Issue Reported Successfully!</h2>
          <p className="text-gray-400 mb-6">Thank you for helping improve the community. The relevant authorities have been notified.</p>
          <p className="text-sm text-gray-500">Redirecting to issues list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <Link href="/civic-issues" className="text-orange-500 hover:text-orange-400 text-sm font-medium mb-4 inline-block">&larr; Back to Issues</Link>
        <h1 className="text-3xl font-bold text-white mb-2">Report a Civic Issue</h1>
        <p className="text-gray-400">Provide details about the problem to help authorities resolve it quickly.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-6">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Issue Title</label>
            <input 
              required type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="e.g., Deep pothole on linking road"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea 
              required name="description" value={formData.description} onChange={handleChange} rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select 
                name="category" value={formData.category} onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="ROAD">Road & Transport</option>
                <option value="GARBAGE">Garbage & Solid Waste</option>
                <option value="WATER">Water Supply</option>
                <option value="ELECTRICITY">Streetlights & Power</option>
                <option value="SANITATION">Public Sanitation</option>
                <option value="DRAINAGE">Drainage & Sewage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority Level</label>
              <select 
                name="priority" value={formData.priority} onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="border-white/10" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-400" /> Location Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Street Address / Landmark</label>
              <input 
                required type="text" name="address" value={formData.address} onChange={handleChange}
                placeholder="Exact location description"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
              <input 
                required type="text" name="city" value={formData.city} onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div className="flex items-end">
              <button 
                type="button" onClick={handleGetLocation} disabled={locating}
                className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MapPin className="w-4 h-4" />
                {locating ? 'Locating...' : 'Get GPS Coordinates'}
              </button>
            </div>
          </div>
          
          {(formData.lat || formData.lng) && (
            <div className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 p-2 rounded-lg border border-green-500/20 inline-flex">
              <CheckCircle2 className="w-3 h-3" /> Coordinates captured: {formData.lat}, {formData.lng}
            </div>
          )}
        </div>

        <hr className="border-white/10" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-orange-400" /> Image Evidence
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Image URL (Optional)</label>
            <input 
              type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> For hackathon purposes, just provide an image URL.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl px-4 py-4 font-bold text-lg transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-pulse">Submitting...</span> : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
