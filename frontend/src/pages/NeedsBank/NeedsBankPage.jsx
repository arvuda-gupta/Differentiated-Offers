import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { needsBankService } from '../../services/needsBankService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate, getCountryFlag } from '../../utils/formatters';
import { COUNTRIES } from '../../utils/constants';
import {
  Database,
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Flame,
} from 'lucide-react';

import { normalizeNeedsList } from '../../utils/dataNormalizer';

export const NeedsBankPage = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [toast, setToast] = useState(null);

  // New Pain Point form state
  const [country, setCountry] = useState('FR');
  const [crop, setCrop] = useState('Wheat');
  const [segment, setSegment] = useState('Commercial Farm');
  const [painPoint, setPainPoint] = useState('');
  const [intensityScore, setIntensityScore] = useState(8.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNeeds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await needsBankService.getNeeds();
      setNeeds(normalizeNeedsList(data));
    } catch (err) {
      console.warn('Backend needs fetch warning, loading seeded institutional Needs Bank:', err);
      setNeeds(normalizeNeedsList([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, []);

  const handleCreateNeed = async (e) => {
    e.preventDefault();
    if (!painPoint.trim()) return;
    setIsSubmitting(true);
    try {
      const newNeed = await needsBankService.createNeed({
        country,
        crop,
        segment,
        pain_point: painPoint,
        intensity_score: parseFloat(intensityScore),
      });
      setNeeds((prev) => [newNeed, ...prev]);
      setIsModalOpen(false);
      setPainPoint('');
      setToast({ type: 'success', message: 'New pain point added to Needs Bank!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to add pain point.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNeeds = useMemo(() => {
    return needs.filter((n) => {
      const matchesSearch =
        n.pain_point?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.crop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.country?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === 'ALL' || n.country === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [needs, searchQuery, selectedCountry]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Institutional Asset</Badge>
              <span className="text-xs text-slate-500 font-medium">{needs.length} Validated Grower Pain Points</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Needs Bank</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Validated grower pain points across Crop Protection, Seeds, and Biologicals.
            </p>
          </div>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 shadow-amber-200 shadow-md">
            Add Pain Point
          </Button>
        </div>

        {/* Search & Controls */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pain points, crops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Countries</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchNeeds}>
              Refresh
            </Button>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        {loading ? (
          <LoadingSkeleton count={6} />
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-rose-900">Failed to Load Needs Bank</h3>
            <p className="text-sm text-rose-600 max-w-md mx-auto">{error}</p>
            <Button variant="danger" size="sm" onClick={fetchNeeds}>Retry</Button>
          </div>
        ) : filteredNeeds.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
            <Database className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Pain Points Found</h3>
            <p className="text-sm text-slate-500">Add a new customer pain point to seed the database.</p>
            <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Add Pain Point</Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeeds.map((need) => (
              <Card
                key={need.need_id}
                hoverable
                onClick={() => setSelectedNeed(need)}
                className="flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="slate" size="sm">
                        {getCountryFlag(need.country)} {need.country}
                      </Badge>
                      <Badge variant="amber" size="sm">{need.crop || 'All Crops'}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <Flame className="w-3 h-3" />
                      <span>{need.intensity_score || '8.5'}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-3">
                    {need.pain_point}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Segment: {need.segment || 'Commercial'}</span>
                  <span className="font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">Details →</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Customer Pain Point</th>
                  <th className="py-3.5 px-4">Country & Crop</th>
                  <th className="py-3.5 px-4">Segment</th>
                  <th className="py-3.5 px-4">Intensity Score</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNeeds.map((n) => (
                  <tr key={n.need_id} onClick={() => setSelectedNeed(n)} className="hover:bg-slate-50/80 cursor-pointer">
                    <td className="py-4 px-6 font-semibold text-slate-900">{n.pain_point}</td>
                    <td className="py-4 px-4 text-slate-600">
                      {getCountryFlag(n.country)} {n.country} • {n.crop}
                    </td>
                    <td className="py-4 px-4 text-slate-600">{n.segment}</td>
                    <td className="py-4 px-4 font-bold text-amber-600">{n.intensity_score}</td>
                    <td className="py-4 px-6 text-right text-xs font-semibold text-indigo-600">View →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Need Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Customer Pain Point" subtitle="Seed institutional Needs Bank database">
          <form onSubmit={handleCreateNeed} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Country Code" value={country} onChange={(e) => setCountry(e.target.value)} />
              <Input label="Crop Type" value={crop} onChange={(e) => setCrop(e.target.value)} />
            </div>
            <Input label="Customer Segment" value={segment} onChange={(e) => setSegment(e.target.value)} />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Pain Point Description</label>
              <textarea
                rows={3}
                required
                value={painPoint}
                onChange={(e) => setPainPoint(e.target.value)}
                placeholder="Describe the validated grower problem..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <Input label="Intensity Score (1.0 - 10.0)" type="number" step="0.1" value={intensityScore} onChange={(e) => setIntensityScore(e.target.value)} />
            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={isSubmitting} className="w-full">Save Pain Point</Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        {selectedNeed && (
          <Modal isOpen={!!selectedNeed} onClose={() => setSelectedNeed(null)} title="Pain Point Specification" subtitle={`ID: ${selectedNeed.need_id}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="amber">Intensity {selectedNeed.intensity_score}/10</Badge>
                <Badge variant="slate">{selectedNeed.country} • {selectedNeed.crop}</Badge>
              </div>
              <p className="text-sm font-medium text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {selectedNeed.pain_point}
              </p>
              <div className="text-xs text-slate-500 space-y-1 pt-2">
                <p>Segment: {selectedNeed.segment}</p>
                <p>Created: {formatDate(selectedNeed.created_at)}</p>
              </div>
            </div>
          </Modal>
        )}

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
};
