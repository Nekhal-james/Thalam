import React from 'react';
import { X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { CulturalEvent } from '../lib/types';

interface TrendHarmonicsProps {
  onClose: () => void;
  events: CulturalEvent[];
}

export const TrendHarmonics: React.FC<TrendHarmonicsProps> = ({ onClose, events }) => {
  // Prepare Data for Charts
  const preservationData = events.map(e => ({
    name: e.name,
    score: e.preservation_score,
    resonance: e.emotional_resonance === 'high' ? 90 : e.emotional_resonance === 'medium' ? 60 : 30
  })).sort((a, b) => b.score - a.score);

  const seasonalData = [
    { month: 'Jan', intensity: 65 },
    { month: 'Feb', intensity: 70 },
    { month: 'Mar', intensity: 85 },
    { month: 'Apr', intensity: 95 }, // Pooram / Vishu season
    { month: 'May', intensity: 60 },
    { month: 'Jun', intensity: 40 }, // Monsoon starts
    { month: 'Jul', intensity: 35 }, // Karkidakam
    { month: 'Aug', intensity: 80 }, // Onam prep
    { month: 'Sep', intensity: 90 }, // Onam
    { month: 'Oct', intensity: 55 },
    { month: 'Nov', intensity: 60 },
    { month: 'Dec', intensity: 85 }, // Theyyam season starts
  ];

  return (
    <div className="fixed inset-0 z-[1500] bg-[#0f1115] overflow-y-auto custom-scrollbar">
      <div className="p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-4xl font-playfair text-white mb-2">Trend Harmonics</h2>
            <p className="text-gray-400 font-light max-w-xl">
              Quantitative analysis of cultural vitality, preservation indices, and seasonal intensity patterns across the mapped region.
            </p>
          </div>
          <button onClick={onClose} className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors">
            Close Analysis <X size={16} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Preservation Index */}
          <div className="glass-panel p-8 rounded-xl">
            <h3 className="text-lg font-serif text-white mb-6">Preservation Index</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={preservationData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="Stability Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Seasonal Intensity */}
          <div className="glass-panel p-8 rounded-xl">
            <h3 className="text-lg font-serif text-white mb-6">Seasonal Intensity Cycle</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="month" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    dot={{fill: '#f59e0b', r: 3}}
                    activeDot={{r: 6, fill: '#fff'}} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* At Risk List */}
          <div className="glass-panel p-8 rounded-xl lg:col-span-2">
            <h3 className="text-lg font-serif text-white mb-6">Critical Monitoring: Risk Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-4 bg-red-900/10 border border-red-500/20 rounded">
                 <h4 className="text-red-400 text-sm uppercase tracking-widest mb-2">High Vulnerability</h4>
                 <p className="text-gray-300 text-sm">Kutiyattam (Score: 60)</p>
                 <p className="text-xs text-gray-500 mt-2">Reason: Dwindling number of trained practitioners; loss of traditional patronage.</p>
               </div>
               <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded">
                 <h4 className="text-amber-400 text-sm uppercase tracking-widest mb-2">Moderate Stress</h4>
                 <p className="text-gray-300 text-sm">Bhuta Kola (Score: 70)</p>
                 <p className="text-xs text-gray-500 mt-2">Reason: Commercialization pressures and ecological changes affecting sacred groves.</p>
               </div>
               <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded">
                 <h4 className="text-emerald-400 text-sm uppercase tracking-widest mb-2">Stable / Resilient</h4>
                 <p className="text-gray-300 text-sm">Thrissur Pooram (Score: 95)</p>
                 <p className="text-xs text-gray-500 mt-2">Reason: Massive community participation and strong institutional funding.</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
