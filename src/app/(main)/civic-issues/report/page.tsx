'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Upload, CheckCircle2, X, ImageIcon, Loader2, AlertCircle, Users, WifiOff, Globe } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { addToQueue, getQueue, removeFromQueue } from '@/lib/offline-queue';

export default function ReportIssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road',
    priority: 'MEDIUM',
    address: '',
    city: 'Mumbai',
    lat: '',
    lng: '',
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [triageLoading, setTriageLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ category?: string; priority?: string; department?: string } | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW register failed:', err));
    }

    // Check offline status
    setIsOffline(!navigator.onLine);
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineIssues();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check existing queue
    getQueue().then(q => setQueuedCount(q.length));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineIssues = async () => {
    const queue = await getQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline issues...`);
    for (const item of queue) {
      try {
        const res = await fetch('/api/civic-issues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        if (res.ok) {
          await removeFromQueue(item.id!);
        }
      } catch (error) {
        console.error('Failed to sync offline issue:', error);
      }
    }
    const remaining = await getQueue();
    setQueuedCount(remaining.length);
  };

  const checkForDuplicates = async () => {
    if (!formData.title || !formData.description || !formData.lat || !formData.lng) return;
    setCheckingDuplicates(true);
    try {
      const res = await fetch('/api/civic-issues/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        }),
      });
      const data = await res.json();
      setDuplicates(data.duplicates || []);
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleAutoTriage = async () => {
    if (formData.description.length < 20) return;
    setTriageLoading(true);
    try {
      const res = await fetch('/api/civic-issues/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: formData.description }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setAiSuggestions(data.suggestion);
      }
    } catch (error) {
      console.error('Error in auto-triage:', error);
    } finally {
      setTriageLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.description.length > 30 && formData.lat && formData.lng) {
        checkForDuplicates();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.lat, formData.lng]);

  const applyAiSuggestion = () => {
    if (!aiSuggestions) return;
    setFormData(prev => ({
      ...prev,
      category: aiSuggestions.category || prev.category,
      priority: aiSuggestions.priority || prev.priority,
    }));
    setAiSuggestions(null);
  };

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
      async (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'ConcordAI/1.0' } }
          );
          const data = await res.json();

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state_district ||
            formData.city;

          const road = data.address?.road || data.address?.pedestrian || data.address?.suburb || '';
          const fullAddress = road ? `${road}, ${city}` : city;

          setFormData((prev) => ({
            ...prev,
            lat,
            lng,
            city,
            address: prev.address || fullAddress,
          }));
        } catch {
          setFormData((prev) => ({
            ...prev,
            lat,
            lng,
          }));
        }
        setLocating(false);
      },
      () => {
        alert('Unable to retrieve your location');
        setLocating(false);
      }
    );
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0 || uploadingImages) return;

    const remaining = 5 - imageUrls.length;
    const toUpload = files.slice(0, remaining);

    if (toUpload.length < files.length) {
      alert('You can only upload a maximum of 5 images');
    }

    setUploadingImages(true);
    try {
      const form = new FormData();
      toUpload.forEach((file) => form.append('files', file));

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Upload failed');
        return;
      }

      const data = await res.json();
      setImageUrls((prev) => [...prev, ...data.urls].slice(0, 5));
    } catch {
      alert('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadingImages) return;
    const files = e.target.files;
    if (files) uploadFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) uploadFiles(Array.from(files));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const issueData = {
      ...formData,
      lat: parseFloat(formData.lat) || 19.076,
      lng: parseFloat(formData.lng) || 72.8777,
      images: imageUrls,
    };

    // Handle offline submission
    if (!navigator.onLine) {
      try {
        await addToQueue(issueData);
        setQueuedCount(prev => prev + 1);
        setSuccess(true);
        setTimeout(() => {
          router.push('/civic-issues');
        }, 2000);
      } catch (error) {
        alert('Failed to save report offline.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/civic-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/civic-issues');
        }, 2000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-sm flex flex-col items-center">
          {isOffline ? (
            <>
              <WifiOff className="w-16 h-16 text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Saved Offline!</h2>
              <p className="text-gray-400 mb-6">You are currently offline. Your report has been saved and will be automatically submitted when you reconnect.</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Issue Reported Successfully!</h2>
              <p className="text-gray-400 mb-6">Thank you for helping improve the community. The relevant authorities have been notified.</p>
            </>
          )}
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
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-gray-400">Provide details about the problem to help authorities resolve it quickly.</p>
          {isOffline && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full border border-orange-400/20">
              <WifiOff className="w-3 h-3" /> OFFLINE MODE
            </span>
          )}
          {queuedCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full border border-blue-400/20">
              <Globe className="w-3 h-3" /> {queuedCount} PENDING SYNC
            </span>
          )}
        </div>
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
              required name="description" value={formData.description} 
              onChange={handleChange} 
              onBlur={handleAutoTriage}
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none"
            />
            {triageLoading && <div className="text-xs text-orange-400 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> AI analyzing issue...</div>}
            {aiSuggestions && (
              <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-between">
                <div className="text-xs text-orange-300">
                  <span className="font-bold">AI Suggestion:</span> {aiSuggestions.category} | {aiSuggestions.priority}
                </div>
                <button 
                  type="button" onClick={applyAiSuggestion}
                  className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select
                name="category" value={formData.category} onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="road">Road & Transport</option>
                <option value="garbage">Garbage & Solid Waste</option>
                <option value="water">Water Supply</option>
                <option value="electricity">Streetlights & Power</option>
                <option value="sanitation">Public Sanitation</option>
                <option value="drainage">Drainage & Sewage</option>
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

        {duplicates.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-yellow-500 font-bold">
              <AlertCircle className="w-5 h-5" />
              Potential Duplicate Issues Found
            </div>
            <p className="text-sm text-gray-400">These issues look similar to yours. You can add your voice to an existing report instead of creating a new one.</p>
            <div className="space-y-2">
              {duplicates.map(issue => (
                <div key={issue.id} className="bg-black/40 border border-white/5 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">{issue.title}</h4>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{issue.description}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded">
                        {Math.round(issue.confidence * 100)}% Match
                      </span>
                    </div>
                  </div>
                  <Link 
                    href={`/civic-issues/${issue.id}`}
                    className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    View & Vote <Users className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <ImageIcon className="w-5 h-5 text-orange-400" /> Image Evidence
            {imageUrls.length > 0 && (
              <span className="text-sm font-normal text-gray-400">({imageUrls.length}/5)</span>
            )}
          </h3>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-orange-400 bg-orange-500/10'
                : 'border-white/20 bg-white/5 hover:border-orange-400/50 hover:bg-white/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {uploadingImages ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
                <p className="text-sm text-gray-400">Uploading images...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-gray-500" />
                <p className="text-sm text-gray-300 font-medium">
                  Drag & drop images here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, WebP or GIF &middot; Max 5MB each &middot; Up to 5 images
                </p>
              </div>
            )}
          </div>

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/30">
                  <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit" disabled={loading || uploadingImages}
            className={cn(
              "w-full rounded-xl px-4 py-4 font-bold text-lg transition-all flex items-center justify-center gap-2",
              isOffline 
                ? "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
            )}
          >
            {loading ? (
              <span className="animate-pulse">Submitting...</span>
            ) : isOffline ? (
              <>Save Offline <WifiOff className="w-5 h-5" /></>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
