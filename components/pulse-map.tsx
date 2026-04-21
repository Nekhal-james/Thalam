import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { CulturalEvent } from '../lib/types';
import L from 'leaflet';
import { Sparkles, Loader2 } from 'lucide-react';
import { discoverMoreLocalTraditions } from '../services/guru';

interface PulseMapProps {
  events: CulturalEvent[];
  onEventSelect: (event: CulturalEvent) => void;
  selectedEventId?: string;
  onAddEvents: (newEvents: CulturalEvent[]) => void;
}

// Custom Map Controller to handle flying to selected locations
const MapController = ({ selectedEvent }: { selectedEvent?: CulturalEvent }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedEvent) {
      map.flyTo([selectedEvent.location.lat, selectedEvent.location.lng], 11, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedEvent, map]);

  return null;
};

export const PulseMap: React.FC<PulseMapProps> = ({ events, onEventSelect, selectedEventId, onAddEvents }) => {
  const [isScanning, setIsScanning] = useState(false);
  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : undefined;

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const existingNames = events.map(e => e.name);
      const results = await discoverMoreLocalTraditions("Kerala", existingNames);
      
      // Transform and add IDs
      const newEvents: CulturalEvent[] = results.map((item: any) => ({
        ...item,
        category: item.category || 'Discovered Tradition',
        id: `gen_${Date.now()}_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
        related_traditions: [], // Initializing empty, DNA explorer will fill connections later
        dna_relationships: [] 
      }));

      onAddEvents(newEvents);
    } catch (err) {
      console.error("Scan failed", err);
    } finally {
      setIsScanning(false);
    }
  };

  // Custom marker styles for "Pulse" effect
  const getMarkerOptions = (event: CulturalEvent, isSelected: boolean) => {
    let baseColor = '#EF4444'; // Red (Default/Ritual)
    
    if (event.type === 'nature') baseColor = '#10B981'; // Emerald Green
    if (event.type === 'history') baseColor = '#78716C'; // Stone Gray
    if (event.type === 'artform') baseColor = '#8B5CF6'; // Violet
    if (event.type === 'custom') baseColor = '#F59E0B'; // Amber
    if (event.type === 'festival') baseColor = '#E11D48'; // Rose

    return {
      radius: isSelected ? 12 : 8,
      fillColor: isSelected ? '#F59E0B' : baseColor, 
      color: isSelected ? '#FFF' : baseColor, // Border matches fill or white
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
    };
  };

  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-neutral-900">
      <MapContainer 
        center={[10.8505, 76.2711]} // Center of Kerala
        zoom={7.5} 
        style={{ height: '100%', width: '100%', background: '#0f1115' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapController selectedEvent={selectedEvent} />

        {/* Pulse Visualizations (Simulated Heatmap/Clusters via Circles for stability) */}
        {events.map((ev) => {
          const isSelected = ev.id === selectedEventId;
          const isGenerated = ev.id.startsWith('gen_');
          const markerOpts = getMarkerOptions(ev, isSelected);

          return (
            <CircleMarker
              key={ev.id}
              center={[ev.location.lat, ev.location.lng]}
              {...markerOpts}
              pathOptions={{
                 fillColor: markerOpts.fillColor,
                 color: markerOpts.color
              }}
              eventHandlers={{
                click: () => onEventSelect(ev),
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
              }}
            >
              <Popup 
                className="custom-popup" 
                closeButton={false}
              >
                <div className="text-gray-900">
                  <strong className="block text-sm font-playfair">{ev.name}</strong>
                  <span className="text-xs text-gray-600 uppercase tracking-wider">{ev.type}</span>
                  {isGenerated && <span className="block text-[10px] text-purple-600 mt-1 flex items-center gap-1"><Sparkles size={8}/> AI Discovered</span>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        
        {/* Render a larger "glow" behind the selected item */}
        {selectedEvent && (
          <CircleMarker
            center={[selectedEvent.location.lat, selectedEvent.location.lng]}
            radius={30}
            pathOptions={{
              color: '#F59E0B',
              fillColor: '#F59E0B',
              fillOpacity: 0.1,
              weight: 0,
              className: 'pulse-animation' 
            }}
          />
        )}
      </MapContainer>
      
      {/* Scan Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="group flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop-blur border border-purple-500/30 hover:border-purple-500/80 hover:bg-slate-800 rounded-full shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <Loader2 className="animate-spin text-purple-400" size={18} />
          ) : (
            <Sparkles className="text-purple-400 group-hover:text-purple-300 transition-colors" size={18} />
          )}
          <span className="text-sm font-medium text-gray-200 group-hover:text-white">
            {isScanning ? "Scanning Deep Culture..." : "Discover Hidden Gems"}
          </span>
        </button>
      </div>

      {/* Decorative overlaid gradients for atmosphere */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[400]" />
      
      <style>{`
        .pulse-animation {
          animation: pulse-ring 3s infinite;
          transform-origin: center;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.3; }
          50% { opacity: 0.1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 4px;
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
};