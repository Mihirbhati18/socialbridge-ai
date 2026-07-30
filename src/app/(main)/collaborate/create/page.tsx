'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { COLLAB_CATEGORIES } from '@/lib/categories';

export default function CreateCollabPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'blood_donation',
    city: 'Mumbai',
    date: '',
    budget: '',
    volunteersNeeded: '',
  });

  const [partners, setPartners] = useState({
    NGO: false,
    SCHOOL: false,
    COLLEGE: false,
    HOSPITAL: false,
    COMPANY: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const requiredPartners = Object.entries(partners)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(',');

      const res = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requiredPartners,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/collaborate/${data.id}`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to create request');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Create Collaboration Request
        </h1>
        <p className="text-gray-600 mt-2">
          Publish your initiative and let our AI Partnership Engine find the right collaborators.
        </p>
      </div>

      <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input
                  required
                  type="text"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50"
                  placeholder="e.g. City-wide Mega Blood Donation Drive"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50"
                  placeholder="Describe your initiative, goals, and what kind of support you need..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white/50"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {COLLAB_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white/50"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white/50"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹) Optional</label>
                  <input
                    type="number"
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white/50"
                    placeholder="e.g. 50000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volunteers Needed</label>
                  <input
                    type="number"
                    className="w-full p-2.5 border border-gray-200 rounded-lg bg-white/50"
                    placeholder="e.g. 50"
                    value={formData.volunteersNeeded}
                    onChange={(e) =>
                      setFormData({ ...formData, volunteersNeeded: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Partner Types
                </label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(partners).map(([type, isChecked]) => (
                    <label
                      key={type}
                      className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                        isChecked
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isChecked}
                        onChange={() =>
                          setPartners((prev) => ({
                            ...prev,
                            [type]: !prev[type as keyof typeof partners],
                          }))
                        }
                      />
                      <span className="text-sm font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 px-8 py-2.5 h-auto text-lg"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Publish Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
