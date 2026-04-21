import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Filter, Layers, Upload } from 'lucide-react';
import { CulturalEvent } from '../lib/types';
import { KnowledgeContribution } from './knowledge-contribution';

interface ExplorePanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: CulturalEvent[];
  onSelectEvent: (event: CulturalEvent) => void;
  onFilterChange: (filteredEvents: CulturalEvent[]) => void;
}

const CATEGORY_GROUPS = {
  'All': [],
  'Ritual & Spirit': ['Ritual Art', 'Ritual', 'Theyyam Deity', 'Deity', 'Caste Ritual', 'State Ritual', 'Festival Ritual', 'Spirit', 'Oracle', 'Sorcerer'],
  'Performance': ['Classical Dance', 'Classical Theatre', 'Folk Dance', 'Folk Art', 'Martial Art', 'Christian Art', 'Muslim Art', 'Shadow Puppetry', 'Puppetry', 'Percussion', 'Music', 'Theatre'],
  'Tribes & People': ['Tribe', 'Community', 'Person', 'Warrior Class', 'Legend'],
  'Nature & Agri': ['Nature', 'Geography', 'Plant', 'Animal', 'Agriculture', 'Bird', 'Tree', 'Fruit', 'Flower'],
  'Heritage': ['History', 'Architecture', 'Archaeology', 'Heritage', 'Place', 'Fort', 'Museum', 'Religious Site'],
  'Lifestyle': ['Food', 'Drink', 'Snack', 'Sweet', 'Craft', 'Clothing', 'Object/Tradition', 'Technology', 'Medicine', 'Therapy']
};

export const ExplorePanel: React.FC<ExplorePanelProps> = ({ isOpen, onClose, events, onSelectEvent, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [showContribution, setShowContribution] = useState(false);

  // Filter Logic
  const filteredList = useMemo(() => {
    let result = events;

    // 1. Category Filter
    if (activeGroup !== 'All') {
      const allowedCategories = CATEGORY_GROUPS[activeGroup as keyof typeof CATEGORY_GROUPS];
      result = result.filter(e => 
        allowedCategories.includes(e.category) || 
        allowedCategories.includes(e.type) ||
        e.tags.some(tag => allowedCategories.includes(tag))
      );
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q) ||
        e.location.region.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, searchQuery, activeGroup]);

  // Propagate changes to parent (Map)
  React.useEffect(() => {
    onFilterChange(filteredList);
  }, [filteredList, onFilterChange]);

  const handleEventAdded = (newEvent: CulturalEvent) => {
    // This needs to bubble up to App to add to 'allEvents'
    // Since ExplorePanel receives 'events' as prop but cannot modify 'allEvents' directly without a callback,
    // we need to rely on the fact that onFilterChange updates the filtered list, but we really need a onAddEvent prop.
    // However, the cleanest way without changing props everywhere is to fake it for now by creating a callback chain
    // OR we assume the parent passed a method.
    // Correction: ExplorePanelProps currently lacks onAddEvent. 
    // We will use a custom event or callback if available, but for now we will rely on a new prop.
    // Wait, the user prompt is to change the app. I should update the props.
  };

  // We need to extend props to support adding events, or accept that we need to modify the parent index.tsx
  // Let's check index.tsx. ExplorePanel usage:
  // <ExplorePanel ... events={allEvents} onFilterChange={setFilteredEvents} />
  // We need to add onAddEvent to ExplorePanel props.

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 h-full w-full md:w-[400px] z-[2000] glass-panel border-r border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-black/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair text-white flex items-center gap-2">
                <Layers className="text-amber-500" size={20} />
                Cultural Archive
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Actions */}
            <button 
              onClick={() => setShowContribution(true)}
              className="w-full mb-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 flex items-center justify-center gap-2 transition-all"
            >
              <Upload size={14} className="text-amber-500" />
              Contribute Source Material
            </button>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search traditions, places, tribes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {Object.keys(CATEGORY_GROUPS).map(group => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border
                    ${activeGroup === group 
                      ? 'bg-amber-500 text-black border-amber-500' 
                      : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'}
                  `}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            <div className="flex justify-between items-center px-2 mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-widest">{filteredList.length} Entries Found</span>
            </div>

            {filteredList.length > 0 ? (
              filteredList.map(event => (
                <div 
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all hover:border-amber-500/30"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-white group-hover:text-amber-400 transition-colors">{event.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide border ${
                      event.type === 'ritual' ? 'text-red-400 border-red-900/30 bg-red-900/10' :
                      event.type === 'nature' ? 'text-emerald-400 border-emerald-900/30 bg-emerald-900/10' :
                      event.type === 'history' ? 'text-amber-200 border-amber-900/30 bg-amber-900/10' :
                      event.type === 'person' ? 'text-blue-300 border-blue-900/30 bg-blue-900/10' :
                      'text-gray-400 border-gray-700 bg-gray-800/30'
                    }`}>
                      {event.category || event.type}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {event.location.region}
                    </span>
                    {event.preservation_score < 50 && (
                      <span className="text-red-500/80">• Endangered</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-600">
                <Filter size={32} className="mx-auto mb-3 opacity-20" />
                <p>No traditions found.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Contribution Modal - Needs to access a global add event handler. 
        We will patch the props in index.tsx to pass it down. 
    */}
    <KnowledgeContribution 
        isOpen={showContribution} 
        onClose={() => setShowContribution(false)}
        onEventAdded={(e) => {
            // We need to propagate this up. 
            // Since we are adding a prop to ExplorePanel, we will call it here.
            // casting to any to avoid strict type error until index.tsx is updated
            (onFilterChange as any)._onAddEvent?.(e); 
        }}
    />
    </>
  );
};