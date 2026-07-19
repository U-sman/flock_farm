import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  DollarSign, 
  ShieldAlert, 
  Activity, 
  ChevronRight, 
  X,
  Syringe,
  Info
} from 'lucide-react';
import { Bird, Gender, BirdStatus, DeathReason, BirdBreed, Lang, BirdBatch } from '../types';

interface FlockRegisterProps {
  birds: Bird[];
  onAddBird: (bird: Omit<Bird, 'id'>) => void;
  onUpdateBird: (id: number, bird: Bird) => void;
  onDeleteBird: (id: number) => void;
  shouldOpenAddModal: boolean;
  onCloseAddModal: () => void;
  vaccinationIntervalDays: number;
  lang?: Lang;
  batches?: BirdBatch[];
  canDelete?: boolean;
  isAdmin?: boolean;
}

export default function FlockRegister({
  birds,
  onAddBird,
  onUpdateBird,
  onDeleteBird,
  shouldOpenAddModal,
  onCloseAddModal,
  vaccinationIntervalDays
}: FlockRegisterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Sold' | 'Dead'>('All');
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(shouldOpenAddModal);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Female');
  const [breed, setBreed] = useState<BirdBreed>('Desi');
  const [dateBought, setDateBought] = useState(new Date().toISOString().split('T')[0]);
  const [price, setPrice] = useState('0');
  const [status, setStatus] = useState<BirdStatus>('Active');
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [ageBoughtDays, setAgeBoughtDays] = useState('0');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [lastVaccinationDate, setLastVaccinationDate] = useState('');

  // Mortality fields
  const [dateDied, setDateDied] = useState('');
  const [deathReason, setDeathReason] = useState<DeathReason>('Disease');
  const [deathDetail, setDeathDetail] = useState('');

  // Sync isAddModalOpen with shouldOpenAddModal prop from parent
  useEffect(() => {
    if (shouldOpenAddModal) {
      setIsAddModalOpen(true);
      onCloseAddModal(); // Reset in parent so it doesn't repeatedly trigger
    }
  }, [shouldOpenAddModal]);

  // Handle resetting form fields
  const resetForm = () => {
    setName('');
    setGender('Female');
    setBreed('Desi');
    setDateBought(new Date().toISOString().split('T')[0]);
    setPrice('0');
    setStatus('Active');
    setSalePrice('');
    setSaleDate(new Date().toISOString().split('T')[0]);
    setAgeBoughtDays('0');
    setDateOfBirth('');
    setLastVaccinationDate('');
    setDateDied('');
    setDeathReason('Disease');
    setDeathDetail('');
  };

  // Age calculation
  const calculateCurrentAge = (bird: Bird) => {
    const boughtDate = new Date(bird.dateBought);
    const currentDate = new Date(); // Dynamic today
    const diffTime = currentDate.getTime() - boughtDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalDays = bird.ageBoughtDays + (diffDays > 0 ? diffDays : 0);
    
    if (totalDays < 30) {
      return `${totalDays} Days`;
    } else if (totalDays < 365) {
      const months = Math.floor(totalDays / 30);
      const remDays = totalDays % 30;
      return `${months} Mo${remDays > 0 ? ` ${remDays} D` : ''}`;
    } else {
      const years = Math.floor(totalDays / 365);
      const remMonths = Math.floor((totalDays % 365) / 30);
      return `${years} Yr${remMonths > 0 ? ` ${remMonths} Mo` : ''}`;
    }
  };

  // Sorting priorities as specified in standard requirements:
  // 1. Male birds first, ordered by Date Bought (Oldest to Newest).
  // 2. Female birds second, ordered by Date Bought (Oldest to Newest).
  const getSortedBirds = (birdsList: Bird[]) => {
    return [...birdsList].sort((a, b) => {
      // Priority 1: Gender (Male first)
      if (a.gender === 'Male' && b.gender === 'Female') return -1;
      if (a.gender === 'Female' && b.gender === 'Male') return 1;

      // Priority 2: Date Bought (Oldest to Newest)
      const dateA = new Date(a.dateBought).getTime();
      const dateB = new Date(b.dateBought).getTime();
      return dateA - dateB;
    });
  };

  // Filter birds
  const filteredAndSortedBirds = getSortedBirds(
    birds.filter(bird => {
      const matchesSearch = bird.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = genderFilter === 'All' || bird.gender === genderFilter;
      const matchesStatus = statusFilter === 'All' || bird.status === statusFilter;
      return matchesSearch && matchesGender && matchesStatus;
    })
  );

  // Submit new bird
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter bird name');

    // Mortality check
    if (status === 'Dead' && (!dateDied || !deathReason)) {
      return alert('Date Died and Death Reason are required for dead birds.');
    }

    onAddBird({
      name: name.trim(),
      gender,
      breed,
      dateBought,
      price: parseFloat(price) || 0,
      status,
      salePrice: status === 'Sold' ? (parseFloat(salePrice) || 0) : undefined,
      saleDate: status === 'Sold' ? saleDate : undefined,
      ageBoughtDays: parseInt(ageBoughtDays) || 0,
      dateOfBirth: dateOfBirth || undefined,
      lastVaccinationDate: lastVaccinationDate || undefined,
      dateDied: status === 'Dead' ? dateDied : undefined,
      deathReason: status === 'Dead' ? deathReason : undefined,
      deathDetail: status === 'Dead' ? deathDetail : undefined,
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  // Open Edit Modal
  const handleOpenEdit = (bird: Bird) => {
    setSelectedBird(bird);
    setName(bird.name);
    setGender(bird.gender);
    setBreed(bird.breed || 'Desi');
    setDateBought(bird.dateBought);
    setPrice(bird.price.toString());
    setStatus(bird.status);
    setSalePrice(bird.salePrice ? String(bird.salePrice) : '');
    setSaleDate(bird.saleDate || new Date().toISOString().split('T')[0]);
    setAgeBoughtDays(bird.ageBoughtDays.toString());
    setDateOfBirth(bird.dateOfBirth || '');
    setLastVaccinationDate(bird.lastVaccinationDate || '');
    setDateDied(bird.dateDied || '');
    setDeathReason(bird.deathReason || 'Disease');
    setDeathDetail(bird.deathDetail || '');
    setIsEditModalOpen(true);
  };

  // Submit edit bird
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBird) return;
    if (!name.trim()) return alert('Please enter bird name');

    // Mortality check
    if (status === 'Dead' && (!dateDied || !deathReason)) {
      return alert('Date Died and Death Reason are required for dead birds.');
    }

    onUpdateBird(selectedBird.id, {
      ...selectedBird,
      name: name.trim(),
      gender,
      breed,
      dateBought,
      price: parseFloat(price) || 0,
      status,
      salePrice: status === 'Sold' ? (parseFloat(salePrice) || 0) : undefined,
      saleDate: status === 'Sold' ? saleDate : undefined,
      ageBoughtDays: parseInt(ageBoughtDays) || 0,
      dateOfBirth: dateOfBirth || undefined,
      lastVaccinationDate: lastVaccinationDate || undefined,
      dateDied: status === 'Dead' ? dateDied : undefined,
      deathReason: status === 'Dead' ? deathReason : undefined,
      deathDetail: status === 'Dead' ? deathDetail : undefined,
    });

    setIsEditModalOpen(false);
    setSelectedBird(null);
    resetForm();
  };

  // Helper for vaccination status text
  const getVaccinationBadge = (lastVac: string | undefined) => {
    if (!lastVac) {
      return <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-3xs font-mono rounded-md">⚠ Unvaccinated</span>;
    }
    const current = new Date();
    const vac = new Date(lastVac);
    const diffDays = Math.floor((current.getTime() - vac.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > vaccinationIntervalDays) {
      return <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-3xs font-mono rounded-md">🔴 Overdue</span>;
    } else if (diffDays >= vaccinationIntervalDays - 7) {
      return <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-3xs font-mono rounded-md">🟡 Due Soon</span>;
    } else {
      return <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-3xs font-mono rounded-md">✅ OK</span>;
    }
  };

  return (
    <div className="space-y-6" id="flock-register-tab">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800">Flock Registry</h2>
          <p className="text-xs text-slate-500">Auto-sorted directory of your birds: Males bought oldest-to-newest first, then Females.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-xs cursor-pointer shrink-0"
          id="btn-add-bird"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bird</span>
        </button>
      </div>

      {/* Filters section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search birds by name... (e.g. 'Purana')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-hidden transition"
            id="bird-search-input"
          />
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Gender filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 border border-slate-100 rounded-xl text-2xs font-semibold">
            <span className="text-gray-400 px-2 font-mono uppercase text-3xs">Gender:</span>
            {(['All', 'Male', 'Female'] as const).map(g => (
              <button 
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  genderFilter === g ? 'bg-white shadow-xs text-indigo-600 border border-slate-100 font-bold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 border border-slate-100 rounded-xl text-2xs font-semibold">
            <span className="text-gray-400 px-2 font-mono uppercase text-3xs">Status:</span>
            {(['All', 'Active', 'Sold', 'Dead'] as const).map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === s ? 'bg-white shadow-xs text-indigo-600 border border-slate-100 font-bold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bird Directory Grid */}
      {filteredAndSortedBirds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No birds match current filters.</p>
          <p className="text-xs text-gray-400 mt-1">Try clearing your filters or adding a new bird to the registry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="bird-cards-grid">
          {filteredAndSortedBirds.map(bird => {
            const isMale = bird.gender === 'Male';
            const isDead = bird.status === 'Dead';
            const isSold = bird.status === 'Sold';
            
            return (
              <div 
                key={bird.id}
                onDoubleClick={() => handleOpenEdit(bird)}
                className={`relative p-5 rounded-2xl border transition duration-150 group hover:-translate-y-0.5 hover:shadow-md cursor-pointer select-none ${
                  isDead ? 'bg-gray-100/75 border-gray-200 opacity-80' :
                  isSold ? 'bg-slate-50 border-slate-200 opacity-90' :
                  isMale 
                    ? 'bg-sky-50/50 border-sky-100 hover:border-sky-300 hover:bg-sky-50' 
                    : 'bg-rose-50/50 border-rose-100 hover:border-rose-300 hover:bg-rose-50'
                }`}
                title="Double click to edit bird profile"
                id={`bird-card-${bird.id}`}
              >
                {/* Gender Indicator Dot */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {isDead && (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-3xs font-mono font-bold rounded-sm uppercase tracking-wider">
                      Dead
                    </span>
                  )}
                  {isSold && (
                    <span className="px-1.5 py-0.5 bg-slate-600 text-white text-3xs font-mono font-bold rounded-sm uppercase tracking-wider">
                      Sold
                    </span>
                  )}
                  <span className={`w-2.5 h-2.5 rounded-full ${isMale ? 'bg-sky-400' : 'bg-rose-400'}`} />
                </div>

                <div className="space-y-4">
                  {/* Name and Basic Info */}
                  <div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-700 transition">
                      {bird.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs text-gray-500 font-mono">ID: BRD-{bird.id.toString().padStart(3, '0')}</p>
                      {bird.breed && (
                        <span className="px-1.5 py-0.5 bg-white/80 border border-slate-200 rounded text-3xs font-semibold text-slate-600">
                          {bird.breed}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attributes Panel */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-2xs border-t border-b border-slate-200/60 py-3 font-medium">
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Gender</span>
                      <span className={`font-semibold ${isMale ? 'text-sky-700' : 'text-rose-700'}`}>{bird.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Calculated Age</span>
                      <span className="text-slate-800 font-mono font-semibold">{calculateCurrentAge(bird)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Acquired Date</span>
                      <span className="text-slate-800 font-mono">{bird.dateBought}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Acquired Price</span>
                      <span className="text-slate-800 font-mono">Rs {bird.price}</span>
                    </div>
                  </div>

                  {/* Health status badge for active birds, or mortality indicators for dead ones */}
                  <div className="flex items-center justify-between text-2xs">
                    {isDead ? (
                      <div className="space-y-1 w-full">
                        <div className="flex justify-between">
                          <span className="text-red-700 font-semibold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {bird.deathReason}
                          </span>
                          <span className="text-slate-400 font-mono text-3xs">{bird.dateDied}</span>
                        </div>
                        {bird.deathDetail && (
                          <p className="text-slate-600 italic text-3xs line-clamp-1 bg-white/70 px-1.5 py-1 rounded border border-slate-100">
                            "{bird.deathDetail}"
                          </p>
                        )}
                      </div>
                    ) : isSold ? (
                      <div className="w-full space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Sold for:</span>
                          <span className="font-mono font-bold text-emerald-700">Rs {(bird.salePrice ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-3xs">
                          <span className="text-slate-400">Profit/Loss vs purchase:</span>
                          <span className={`font-mono font-bold ${((bird.salePrice ?? 0) - bird.price) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            Rs {((bird.salePrice ?? 0) - bird.price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center w-full">
                        <span className="text-slate-500">Vaccine Status:</span>
                        {getVaccinationBadge(bird.lastVaccinationDate)}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 justify-end pt-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-150">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(bird); }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-indigo-600 rounded-lg text-2xs transition font-semibold"
                      title="Edit"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this bird?')) onDeleteBird(bird.id); }}
                      className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 text-red-600 rounded-lg text-2xs transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD BIRD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base font-display">Log New Bird in Registry</h3>
                <p className="text-3xs text-slate-300">Register new bird acquisition records</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bird Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Purana kukar, Lali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Gender *</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  >
                    <option value="Female">Female (Hen)</option>
                    <option value="Male">Male (Rooster)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Breed / Type</label>
                <select 
                  value={breed}
                  onChange={(e) => setBreed(e.target.value as BirdBreed)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  id="add-bird-breed"
                >
                  <option value="Desi">Desi</option>
                  <option value="Rhode Island">Rhode Island</option>
                  <option value="Broiler">Broiler</option>
                  <option value="Layer">Layer</option>
                  <option value="Fayoumi">Fayoumi</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price (Rs)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="Acquisition cost"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Age Bought (Days)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="Age in days when bought"
                    value={ageBoughtDays}
                    onChange={(e) => setAgeBoughtDays(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date Bought</label>
                  <input 
                    type="date"
                    value={dateBought}
                    onChange={(e) => setDateBought(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date of Birth (Optional)</label>
                  <input 
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Vaccination Date</label>
                <input 
                  type="date"
                  value={lastVaccinationDate}
                  onChange={(e) => setLastVaccinationDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registry Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BirdStatus)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                >
                  <option value="Active">Active (In Flock)</option>
                  <option value="Sold">Sold</option>
                  <option value="Dead">Dead (Deceased)</option>
                </select>
              </div>

              {/* Sale price input, shown when marking a bird as Sold */}
              {status === 'Sold' && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 animate-in fade-in duration-150">
                  <label className="block text-3xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Sale Price (Rs) *</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    placeholder="Amount received for this bird"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-emerald-200 rounded-xl focus:border-emerald-400 focus:outline-hidden bg-white text-emerald-950"
                  />
                  <label className="block text-3xs font-bold text-emerald-700 uppercase tracking-wider mb-1 pt-1">Sale Date *</label>
                  <input 
                    type="date"
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-emerald-200 rounded-xl focus:border-emerald-400 focus:outline-hidden bg-white text-emerald-950"
                  />
                  <p className="text-3xs text-emerald-700">This is tracked as income in your Financial Ledger totals.</p>
                </div>
              )}

              {/* Conditionally rendered Mortality inputs when Status == Dead */}
              {status === 'Dead' && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-3 animate-in fade-in duration-150">
                  <h4 className="font-bold text-xs text-red-800 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" /> Mortality Log Required Fields
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-3xs font-bold text-red-700 uppercase tracking-wider mb-1">Date Died *</label>
                      <input 
                        type="date"
                        required
                        value={dateDied}
                        onChange={(e) => setDateDied(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-red-200 rounded-xl focus:border-red-400 focus:outline-hidden bg-white text-red-950"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold text-red-700 uppercase tracking-wider mb-1">Reason *</label>
                      <select 
                        required
                        value={deathReason}
                        onChange={(e) => setDeathReason(e.target.value as DeathReason)}
                        className="w-full text-xs px-2.5 py-1.5 border border-red-200 rounded-xl focus:border-red-400 focus:outline-hidden bg-white text-red-950"
                      >
                        <option value="Disease">Disease</option>
                        <option value="Injury">Injury</option>
                        <option value="Predator">Predator</option>
                        <option value="Other">Other</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-red-700 uppercase tracking-wider mb-1">Death Detail Notes</label>
                    <textarea 
                      placeholder="e.g. Dawai no di thi us wqt, or secondary symptoms..."
                      value={deathDetail}
                      onChange={(e) => setDeathDetail(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-red-200 rounded-xl focus:border-red-400 focus:outline-hidden bg-white text-red-950 h-16 resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-xs"
                >
                  Save Bird Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT BIRD PROFILE MODAL --- */}
      {isEditModalOpen && selectedBird && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base font-display">Edit Bird Profile: {selectedBird.name}</h3>
                <p className="text-3xs text-slate-300">Modify bird health, purchase price, or status details</p>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedBird(null); }} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bird Name *</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Gender *</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  >
                    <option value="Female">Female (Hen)</option>
                    <option value="Male">Male (Rooster)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Breed / Type</label>
                <select 
                  value={breed}
                  onChange={(e) => setBreed(e.target.value as BirdBreed)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  id="edit-bird-breed"
                >
                  <option value="Desi">Desi</option>
                  <option value="Rhode Island">Rhode Island</option>
                  <option value="Broiler">Broiler</option>
                  <option value="Layer">Layer</option>
                  <option value="Fayoumi">Fayoumi</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price (Rs)</label>
                  <input 
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Age Bought (Days)</label>
                  <input 
                    type="number"
                    min="0"
                    value={ageBoughtDays}
                    onChange={(e) => setAgeBoughtDays(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date Bought</label>
                  <input 
                    type="date"
                    value={dateBought}
                    onChange={(e) => setDateBought(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date of Birth (Optional)</label>
                  <input 
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Vaccination Date</label>
                <input 
                  type="date"
                  value={lastVaccinationDate}
                  onChange={(e) => setLastVaccinationDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registry Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BirdStatus)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-hidden"
                >
                  <option value="Active">Active (In Flock)</option>
                  <option value="Sold">Sold</option>
                  <option value="Dead">Dead (Deceased)</option>
                </select>
              </div>

              {/* Sale price input, shown when marking a bird as Sold */}
              {status === 'Sold' && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 animate-in fade-in duration-150">
                  <label className="block text-3xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Sale Price (Rs) *</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    placeholder="Amount received for this bird"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-emerald-200 rounded-xl focus:border-emerald-400 focus:outline-hidden bg-white text-emerald-950"
                  />
                  <label className="block text-3xs font-bold text-emerald-700 uppercase tracking-wider mb-1 pt-1">Sale Date *</label>
                  <input 
                    type="date"
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-emerald-200 rounded-xl focus:border-emerald-400 focus:outline-hidden bg-white text-emerald-950"
                  />
                  <p className="text-3xs text-emerald-700">This is tracked as income in your Financial Ledger totals.</p>
                </div>
              )}

              {/* Conditionally rendered Mortality inputs when Status == Dead */}
              {status === 'Dead' && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-3 animate-in fade-in duration-150">
                  <h4 className="font-bold text-xs text-red-800 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" /> Mortality Log Required Fields
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-3xs font-bold text-red-700 uppercase tracking-wider mb-1">Date Died *</label>
                      <input 
                        type="date"
                        required
                        value={dateDied}
                        onChange={(e) => setDateDied(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-red-200 rounded-xl focus:border-red-400 focus:outline-hidden bg-white text-red-950"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold text-red-700 uppercase tracking-wider mb-1">Reason *</label>
                      <select 
                        required
                        value={deathReason}
                        onChange={(e) => setDeathReason(e.target.value as DeathReason)}
                        className="w-full text-xs px-2.5 py-1.5 border border-red-200 rounded-xl focus:border-red-400 focus:outline-hidden bg-white text-red-950"
                      >
                        <option value="Disease">Disease</option>
                        <option value="Injury">Injury</option>
                        <option value="Predator">Predator</option>
                        <option value="Other">Other</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-red-700 uppercase tracking-wider mb-1">Death Detail Notes</label>
                    <textarea 
                      placeholder="e.g. Dawai no di thi us wqt, or secondary symptoms..."
                      value={deathDetail}
                      onChange={(e) => setDeathDetail(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-red-200 rounded-xl focus:border-red-400 focus:outline-hidden bg-white text-red-950 h-16 resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setIsEditModalOpen(false); setSelectedBird(null); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
