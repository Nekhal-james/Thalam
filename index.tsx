import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ViewMode, CulturalEvent } from './lib/types';
import { PulseMap } from './components/pulse-map';
import { CulturalInsightSheet } from './components/cultural-insight-sheet';
import { GuruInterface } from './components/guru-panel';
import { CulturalDNAExplorer } from './components/cultural-dna-explorer';
import { TrendHarmonics } from './components/trend-harmonics';
import { LandingPage } from './components/landing-page';
import { ExplorePanel } from './components/explore-panel';
import { Activity, Network, BarChart3, Layers } from 'lucide-react';
import { CULTURAL_EVENTS } from './lib/data-provider';

const App = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('LANDING');
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | null>(null);
  
  // Master list of events
  const [allEvents, setAllEvents] = useState<CulturalEvent[]>(CULTURAL_EVENTS);
  
  // Filtered list for Map display
  const [filteredEvents, setFilteredEvents] = useState<CulturalEvent[]>(CULTURAL_EVENTS);
  
  // UI State
  const [showExplorePanel, setShowExplorePanel] = useState(false);

  // Navigation Logic
  const handleEventSelect = (event: CulturalEvent) => {
    setSelectedEvent(event);
    // If selecting from panel, ensure we are in map mode
    if (viewMode !== 'PULSE_MAP') setViewMode('PULSE_MAP');
  };

  const handleAddEvents = (newEvents: CulturalEvent[]) => {
    // Prevent duplicates by ID
    const uniqueNew = newEvents.filter(ne => !allEvents.some(ae => ae.id === ne.id));
    
    if (uniqueNew.length > 0) {
      const updated = [...allEvents, ...uniqueNew];
      setAllEvents(updated);
      setFilteredEvents(updated); // Reset filter to show new adds immediately
    }
  };

  const handleUpdateEvent = (updatedEvent: CulturalEvent) => {
    const updatedList = allEvents.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev);
    setAllEvents(updatedList);
    setFilteredEvents(updatedList);
    if (selectedEvent?.id === updatedEvent.id) {
        setSelectedEvent(updatedEvent);
    }
  };

  const handleManualPin = (event: CulturalEvent) => {
    const updated = [...allEvents, event];
    setAllEvents(updated);
    setFilteredEvents(updated);
  };

  const handleContributedEvent = (event: CulturalEvent) => {
      handleAddEvents([event]);
  };

  return (
    <div className="relative w-full h-screen bg-[#0f1115] text-white overflow-hidden selection:bg-amber-500/30">
      
      {/* 0. Landing Page Layer */}
      {viewMode === 'LANDING' ? (
        <LandingPage 
          onEnter={() => setViewMode('PULSE_MAP')}
          onAddEvent={handleManualPin}
        />
      ) : (
        <>
          {/* 1. Main Visualization Layer (Pulse Map is base) */}
          <div className="absolute inset-0 z-0">
            <PulseMap 
              events={filteredEvents} // Pass filtered events to map
              onEventSelect={handleEventSelect} 
              selectedEventId={selectedEvent?.id}
              onAddEvents={handleAddEvents}
            />
          </div>

          {/* 2. Top Navigation (Minimalist - Only visible when not in LANDING) */}
          <nav className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto cursor-pointer flex flex-col gap-2">
              <div onClick={() => setViewMode('LANDING')}>
                <h1 className="text-3xl font-playfair tracking-wide text-white drop-shadow-lg">Thalam</h1>
                <p className="text-xs text-amber-500/80 uppercase tracking-[0.2em] mt-1 ml-1">Cultural Intelligence</p>
              </div>
              
              {/* Explore Toggle Button */}
              <button 
                onClick={() => setShowExplorePanel(!showExplorePanel)}
                className={`flex items-center gap-2 px-4 py-2 mt-4 rounded-full border backdrop-blur-md transition-all text-sm font-medium
                  ${showExplorePanel 
                    ? 'bg-amber-500 text-black border-amber-500' 
                    : 'bg-black/40 text-white border-white/10 hover:border-white/30'}`}
              >
                <Layers size={16} />
                {showExplorePanel ? 'Close Archive' : 'Browse Archive'}
              </button>
            </div>

            <div className="flex gap-2 pointer-events-auto bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
              <button 
                onClick={() => setViewMode('PULSE_MAP')}
                className={`p-2 rounded-full transition-all ${viewMode === 'PULSE_MAP' ? 'bg-white/10 text-amber-400' : 'text-gray-400 hover:text-white'}`}
                title="Pulse Map"
              >
                <Activity size={18} />
              </button>
              <button 
                onClick={() => setViewMode('DNA_EXPLORER')}
                className={`p-2 rounded-full transition-all ${viewMode === 'DNA_EXPLORER' ? 'bg-white/10 text-amber-400' : 'text-gray-400 hover:text-white'}`}
                title="DNA Explorer"
              >
                <Network size={18} />
              </button>
              <button 
                onClick={() => setViewMode('TREND_HARMONICS')}
                className={`p-2 rounded-full transition-all ${viewMode === 'TREND_HARMONICS' ? 'bg-white/10 text-amber-400' : 'text-gray-400 hover:text-white'}`}
                title="Trend Harmonics"
              >
                <BarChart3 size={18} />
              </button>
            </div>
          </nav>

          {/* 3. Overlays & Modals */}
          
          {/* Explore Panel (Side Panel) */}
          <ExplorePanel 
            isOpen={showExplorePanel}
            onClose={() => setShowExplorePanel(false)}
            events={allEvents}
            onSelectEvent={handleEventSelect}
            // We attach the add handler to the filter function object to avoid changing the type signature extensively in this patch
            onFilterChange={(e) => {
                setFilteredEvents(e);
                (e as any)._onAddEvent = handleContributedEvent;
            }}
          />

          {/* Insight Sheet (Only in Map Mode when event selected) */}
          {viewMode === 'PULSE_MAP' && (
            <CulturalInsightSheet 
              event={selectedEvent} 
              allEvents={allEvents}
              onClose={() => setSelectedEvent(null)}
              onNavigateToDNA={(id) => {
                 setViewMode('DNA_EXPLORER');
              }} 
            />
          )}

          {/* Full Screen Modes */}
          {viewMode === 'DNA_EXPLORER' && (
            <CulturalDNAExplorer 
              events={allEvents}
              onClose={() => setViewMode('PULSE_MAP')} 
              rootEventId={selectedEvent?.id}
              onAddEvents={handleAddEvents}
              onUpdateEvent={handleUpdateEvent}
              onSelectNode={(id) => {
                 const ev = allEvents.find(e => e.id === id);
                 if (ev) setSelectedEvent(ev);
              }}
            />
          )}

          {viewMode === 'TREND_HARMONICS' && (
            <TrendHarmonics 
              onClose={() => setViewMode('PULSE_MAP')} 
              events={allEvents}
            />
          )}

          {/* 4. Guru AI (Global - Opt-in) */}
          <GuruInterface selectedEvent={selectedEvent || undefined} />
        </>
      )}
      
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);