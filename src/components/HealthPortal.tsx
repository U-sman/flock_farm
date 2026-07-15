import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldAlert, 
  Activity, 
  Syringe, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  Clock,
  Check
} from 'lucide-react';
import { Bird, DeathReason } from '../types';

interface HealthPortalProps {
  birds: Bird[];
  vaccinationIntervalDays: number;
  onUpdateBird: (id: number, bird: Bird) => void;
}

export default function HealthPortal({
  birds,
  vaccinationIntervalDays,
  onUpdateBird
}: HealthPortalProps) {
  // --- B. MORTALITY ENGINE ---
  const deadBirds = birds.filter(b => b.status === 'Dead');
  const totalDeadCount = deadBirds.length;

  // Breakdown by death reason category
  const deathBreakdown: Record<DeathReason, number> = {
    Disease: deadBirds.filter(b => b.deathReason === 'Disease').length,
    Injury: deadBirds.filter(b => b.deathReason === 'Injury').length,
    Predator: deadBirds.filter(b => b.deathReason === 'Predator').length,
    Other: deadBirds.filter(b => b.deathReason === 'Other').length,
    Unknown: deadBirds.filter(b => b.deathReason === 'Unknown').length,
  };

  // --- C. VACCINATION ENGINE ---
  // Tracks vaccine health compliance for "Active" birds only
  const activeBirds = birds.filter(b => b.status === 'Active');

  const getVaccinationStatus = (lastVaccinationDate: string | undefined) => {
    if (!lastVaccinationDate) {
      return { 
        status: 'Not Recorded' as const, 
        label: '⚠ Not Recorded', 
        color: 'bg-amber-50 text-amber-800 border-amber-200', 
        icon: HelpCircle,
        days: -1 
      };
    }
    const current = new Date();
    const last = new Date(lastVaccinationDate);
    const diffTime = current.getTime() - last.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > vaccinationIntervalDays) {
      return { 
        status: 'Overdue' as const, 
        label: '🔴 Overdue', 
        color: 'bg-red-50 text-red-800 border-red-200', 
        icon: XCircle,
        days: diffDays 
      };
    } else if (diffDays >= vaccinationIntervalDays - 7) {
      return { 
        status: 'Due Soon' as const, 
        label: '🟡 Due Soon', 
        color: 'bg-yellow-50 text-yellow-800 border-yellow-200', 
        icon: AlertTriangle,
        days: diffDays 
      };
    } else {
      return { 
        status: 'OK' as const, 
        label: '✅ OK', 
        color: 'bg-green-50 text-green-800 border-green-200', 
        icon: CheckCircle2,
        days: diffDays 
      };
    }
  };

  // Compile aggregate metrics for vaccinations
  const vacMetrics = {
    notRecorded: 0,
    overdue: 0,
    dueSoon: 0,
    ok: 0
  };

  activeBirds.forEach(bird => {
    const info = getVaccinationStatus(bird.lastVaccinationDate);
    if (info.status === 'Not Recorded') vacMetrics.notRecorded++;
    else if (info.status === 'Overdue') vacMetrics.overdue++;
    else if (info.status === 'Due Soon') vacMetrics.dueSoon++;
    else if (info.status === 'OK') vacMetrics.ok++;
  });

  // Action: Mark vaccinated today
  const handleMarkVaccinated = (bird: Bird) => {
    const todayStr = new Date().toISOString().split('T')[0];
    onUpdateBird(bird.id, {
      ...bird,
      lastVaccinationDate: todayStr
    });
  };

  return (
    <div className="space-y-6" id="health-portal-tab">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800">Health Portal</h2>
        <p className="text-xs text-slate-500">Monitor mortality stats and track vaccination schedules to keep your flock immune and healthy.</p>
      </div>

      {/* Grid: Vaccination compliance metrics on left, Mortality overview on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VACCINATION TRACKER PANEL */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2">
              <Syringe className="w-5 h-5 text-indigo-600" /> Vaccination Scheduler
            </h3>
            <span className="text-2xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100 font-bold shrink-0">
              Interval: {vaccinationIntervalDays} Days
            </span>
          </div>

          {/* Aggregates view */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 text-center rounded-xl">
              <span className="text-lg font-extrabold font-mono text-emerald-700">{vacMetrics.ok}</span>
              <p className="text-4xs font-semibold text-emerald-800 uppercase font-mono tracking-wider mt-1">✅ OK</p>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-100 text-center rounded-xl">
              <span className="text-lg font-extrabold font-mono text-amber-700">{vacMetrics.dueSoon}</span>
              <p className="text-4xs font-semibold text-amber-800 uppercase font-mono tracking-wider mt-1">🟡 Due Soon</p>
            </div>
            <div className="p-3 bg-rose-50/60 border border-rose-100 text-center rounded-xl">
              <span className="text-lg font-extrabold font-mono text-rose-700">{vacMetrics.overdue}</span>
              <p className="text-4xs font-semibold text-rose-800 uppercase font-mono tracking-wider mt-1">🔴 Overdue</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 text-center rounded-xl">
              <span className="text-lg font-extrabold font-mono text-slate-700">{vacMetrics.notRecorded}</span>
              <p className="text-4xs font-semibold text-slate-800 uppercase font-mono tracking-wider mt-1">⚠ No Record</p>
            </div>
          </div>

          {/* Active birds schedule list */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Flock Immunization Log</h4>
            
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
              {activeBirds.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400 italic bg-slate-50/50">No active birds registered.</p>
              ) : (
                activeBirds.map(bird => {
                  const info = getVaccinationStatus(bird.lastVaccinationDate);
                  const IconComponent = info.icon;
                  
                  return (
                    <div key={bird.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 text-xs bg-white hover:bg-slate-50/50 gap-2.5 border-b border-slate-100 last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{bird.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-3xs font-semibold ${bird.gender === 'Male' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-700'}`}>
                            {bird.gender}
                          </span>
                        </div>
                        <p className="text-3xs text-slate-500 font-mono mt-0.5">
                          Last: {bird.lastVaccinationDate || 'Never recorded'} 
                          {info.days >= 0 && ` (${info.days} days ago)`}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
                        <span className={`px-2 py-0.5 border text-3xs font-bold font-mono rounded-md flex items-center gap-1 shrink-0 ${info.color}`}>
                          <IconComponent className="w-3 h-3 shrink-0" /> {info.status}
                        </span>
                        
                        <button 
                          onClick={() => handleMarkVaccinated(bird)}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-3xs font-bold border border-indigo-100 transition shrink-0 flex items-center gap-0.5 cursor-pointer"
                          title="Click to register vaccination today"
                        >
                          <Check className="w-3 h-3" /> Vaccine Today
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* MORTALITY LOG SUMMARY */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" /> Mortality Engine
            </h3>
            <span className="text-2xs font-mono bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-100 font-bold shrink-0">
              Total Dead Count: {totalDeadCount}
            </span>
          </div>

          {/* Deaths breakdown categorized card */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2.5">Losses Breakdown by Cause</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-semibold">
              <div className="p-2.5 bg-red-50/50 rounded-xl border border-red-100">
                <span className="text-lg font-bold font-mono text-red-800">{deathBreakdown.Disease}</span>
                <p className="text-4xs text-red-600 mt-1 uppercase font-mono tracking-wider">Disease</p>
              </div>
              <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                <span className="text-lg font-bold font-mono text-amber-800">{deathBreakdown.Injury}</span>
                <p className="text-4xs text-amber-600 mt-1 uppercase font-mono tracking-wider">Injury</p>
              </div>
              <div className="p-2.5 bg-orange-50/50 rounded-xl border border-orange-100">
                <span className="text-lg font-bold font-mono text-orange-800">{deathBreakdown.Predator}</span>
                <p className="text-4xs text-orange-600 mt-1 uppercase font-mono tracking-wider">Predator</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-lg font-bold font-mono text-slate-800">{deathBreakdown.Other}</span>
                <p className="text-4xs text-slate-600 mt-1 uppercase font-mono tracking-wider">Other</p>
              </div>
              <div className="p-2.5 bg-slate-100/50 rounded-xl border border-slate-200">
                <span className="text-lg font-bold font-mono text-slate-800">{deathBreakdown.Unknown}</span>
                <p className="text-4xs text-slate-600 mt-1 uppercase font-mono tracking-wider">Unknown</p>
              </div>
            </div>
          </div>

          {/* Historical Dead Birds details register */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Deceased Birds History</h4>
            
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
              {deadBirds.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400 italic bg-slate-50/50">Zero mortality logs found. Excellent coop health!</p>
              ) : (
                deadBirds.map(bird => (
                  <div key={bird.id} className="p-3 bg-rose-50/10 hover:bg-rose-50/25 text-xs border-b border-slate-100 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{bird.name}</span>
                          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 border border-rose-200 rounded text-3xs font-bold font-mono">
                            {bird.deathReason}
                          </span>
                        </div>
                        <p className="text-3xs text-slate-500 font-mono mt-0.5">Bought: {bird.dateBought} ({bird.price ? `Rs ${bird.price}` : 'Free'})</p>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <span className="text-rose-700 font-mono font-bold text-3xs uppercase tracking-wider block">Died on {bird.dateDied}</span>
                        <span className="text-3xs text-slate-400 font-mono mt-0.5 block">Age bought: {bird.ageBoughtDays} days</span>
                      </div>
                    </div>
                    {bird.deathDetail && (
                      <div className="mt-2 text-3xs text-slate-600 bg-white border border-rose-100 p-2 rounded-lg italic">
                        "{bird.deathDetail}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
