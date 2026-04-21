import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CulturalEvent } from '../lib/types';
import { X, MapPin, Calendar, Activity, Sparkles } from 'lucide-react';

interface CulturalInsightSheetProps {
  event: CulturalEvent | null;
  allEvents: CulturalEvent[];
  onClose: () => void;
  onNavigateToDNA: (eventId: string) => void;
}

export const CulturalInsightSheet: React.FC<CulturalInsightSheetProps> = ({ event, allEvents, onClose, onNavigateToDNA }) => {
  
  if (!event) return null;

  // Find related events from the full dynamic list
  const related = allEvents.filter(e => event.related_traditions?.includes(e.id));
  const isGenerated = event.id.startsWith('gen_');

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[1000] flex justify-center pointer-events-none"
        >
          <div className="w-full max-w-3xl glass-panel rounded-t-2xl pointer-events-auto shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="relative p-6 border-b border-white/10">
              <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2 mb-2 text-amber-500/80 text-xs font-semibold tracking-widest uppercase">
                <Activity size={12} />
                <span>{event.type}</span>
                {isGenerated && (
                  <span className="flex items-center gap-1 text-purple-400 ml-2 border border-purple-500/30 px-1.5 rounded bg-purple-900/20">
                    <Sparkles size={10} /> Discovered
                  </span>
                )}
              </div>
              
              <h2 className="text-3xl font-playfair text-white mb-1">{event.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={14} /> {event.location.region}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {event.seasonal_markers?.join(', ')}</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Main Description */}
                <div className="md:col-span-2 space-y-6">
                  <section>
                    <h3 className="text-amber-500 font-serif text-lg mb-2">The Essence</h3>
                    <p className="text-gray-300 leading-relaxed font-light">{event.description}</p>
                  </section>
                  
                  <section>
                    <h3 className="text-amber-500 font-serif text-lg mb-2">Why This Matters</h3>
                    <div className="p-4 bg-white/5 rounded-lg border-l-2 border-amber-500/50">
                      <p className="text-gray-300 text-sm italic">{event.significance}</p>
                    </div>
                  </section>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {event.tags?.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 border border-white/5">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Sidebar Stats & Connections */}
                <div className="space-y-6">
                  <div className="bg-black/20 p-4 rounded-lg">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Preservation Score</h4>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-light text-white">{event.preservation_score}</span>
                      <span className="text-xs text-gray-400 mb-1">/ 100</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${event.preservation_score}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Cultural DNA</h4>
                    {related.length > 0 ? (
                      <div className="space-y-3">
                        {related.map(r => (
                          <div key={r.id} className="group cursor-pointer" onClick={() => onNavigateToDNA(r.id)}>
                            <div className="text-sm text-gray-300 group-hover:text-amber-400 transition-colors">{r.name}</div>
                            <div className="text-xs text-gray-600">{r.type}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 italic">No direct relations mapped yet.</p>
                    )}
                    
                    <button 
                      onClick={() => onNavigateToDNA(event.id)}
                      className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-xs uppercase tracking-widest text-amber-500 border border-amber-500/20 hover:border-amber-500/50 transition-all rounded"
                    >
                      Explore Connections
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
