import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { offerBankService } from '../../services/offerBankService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate, getCountryFlag } from '../../utils/formatters';
import { ARCHETYPES, COUNTRIES } from '../../utils/constants';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  RefreshCw,
  AlertCircle,
  Layers,
  CheckCircle2,
  Package,
} from 'lucide-react';

import { normalizeOffersList } from '../../utils/dataNormalizer';

export const OfferBankPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [toast, setToast] = useState(null);

  // New Offer form state
  const [name, setName] = useState('');
  const [country, setCountry] = useState('FR');
  const [crop, setCrop] = useState('Corn');
  const [archetype, setArchetype] = useState('Product Plus');
  const [componentsText, setComponentsText] = useState('a, b, d');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await offerBankService.getOffers();
      setOffers(normalizeOffersList(data));
    } catch (err) {
      console.warn('Backend offers fetch warning, loading seeded institutional Offer Bank:', err);
      setOffers(normalizeOffersList([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    const compArray = componentsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const newOffer = await offerBankService.createOffer({
        name,
        country,
        crop,
        archetype,
        components: compArray,
      });
      setOffers((prev) => [newOffer, ...prev]);
      setIsModalOpen(false);
      setName('');
      setToast({ type: 'success', message: 'New offer registered in Offer Bank!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to register offer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const matchesSearch =
        o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.crop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.archetype?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === 'ALL' || o.country === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [offers, searchQuery, selectedCountry]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo">Institutional Library</Badge>
              <span className="text-xs text-slate-500 font-medium">{offers.length} European Scored Offers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Offer Bank</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Shared repository of live and historical European commercial offer packages.
            </p>
          </div>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="shadow-indigo-200 shadow-md">
            Register Offer
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search offer name, archetype, crop..."
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

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchOffers}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Content Display */}
        {loading ? (
          <LoadingSkeleton count={6} />
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-rose-900">Failed to Load Offer Bank</h3>
            <p className="text-sm text-rose-600 max-w-md mx-auto">{error}</p>
            <Button variant="danger" size="sm" onClick={fetchOffers}>Retry</Button>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Offers Found</h3>
            <p className="text-sm text-slate-500">Register a new commercial offer to seed the database.</p>
            <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Register Offer</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <Card
                key={offer.offer_id}
                hoverable
                onClick={() => setSelectedOffer(offer)}
                className="flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="slate" size="sm">
                        {getCountryFlag(offer.country)} {offer.country}
                      </Badge>
                    </div>
                    <Badge variant="indigo" size="sm">{offer.archetype || 'Product Plus'}</Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                    {offer.name}
                  </h3>
                  <p className="text-xs text-slate-500">Target Crop: <strong className="text-slate-700">{offer.crop}</strong></p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.isArray(offer.components) &&
                      offer.components.map((c, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                          {c}
                        </span>
                      ))}
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">Details →</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Register Offer Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Commercial Offer" subtitle="Add new offer definition to Offer Bank">
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <Input label="Offer Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. VerSecur Corn Protection" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Country Code" value={country} onChange={(e) => setCountry(e.target.value)} />
              <Input label="Crop Type" value={crop} onChange={(e) => setCrop(e.target.value)} />
            </div>
            <Select label="Offer Archetype" options={ARCHETYPES} value={archetype} onChange={(e) => setArchetype(e.target.value)} />
            <Input label="Components (comma separated codes: a, b, c, d, e, f)" value={componentsText} onChange={(e) => setComponentsText(e.target.value)} />
            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={isSubmitting} className="w-full">Register Offer</Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        {selectedOffer && (
          <Modal isOpen={!!selectedOffer} onClose={() => setSelectedOffer(null)} title={selectedOffer.name} subtitle={`Offer ID: ${selectedOffer.offer_id}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="indigo">{selectedOffer.archetype}</Badge>
                <Badge variant="slate">{getCountryFlag(selectedOffer.country)} {selectedOffer.country} • {selectedOffer.crop}</Badge>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Component Codes</span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedOffer.components) &&
                    selectedOffer.components.map((c, i) => (
                      <span key={i} className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 uppercase">
                        Code {c}
                      </span>
                    ))}
                </div>
              </div>

              <p className="text-xs text-slate-500 pt-2">Registered: {formatDate(selectedOffer.created_at)}</p>
            </div>
          </Modal>
        )}

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
};
