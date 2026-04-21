import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Network } from 'vis-network';
import { CulturalEvent, Relationship } from '../lib/types';
import { X, Search, Sparkles, Loader2, GitBranch, Info, ChevronRight, Activity } from 'lucide-react';
import { discoverTraditionConnections } from '../services/guru';
import { motion, AnimatePresence } from 'framer-motion';

interface DNAExplorerProps {
  onClose: () => void;
  rootEventId?: string;
  onSelectNode: (eventId: string) => void;
  onAddEvents: (events: CulturalEvent[]) => void;
  onUpdateEvent: (event: CulturalEvent) => void;
  events: CulturalEvent[];
}

interface GraphNode {
  id: string;
  label: string;
  group: string;
  value: number;
  title: string;
  shape?: string;
  image?: string;
  color?: any;
}

interface GraphEdge {
  from: string;
  to: string;
  width: number;
  color: { opacity: number; color?: string };
  dashes: boolean;
  id?: string;
}

export const CulturalDNAExplorer: React.FC<DNAExplorerProps> = ({ 
  onClose, 
  rootEventId, 
  onSelectNode, 
  onAddEvents,
  onUpdateEvent,
  events 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(rootEventId || null);
  
  // Generate SVG Data URI for node icons
  const getIconForType = (type: string) => {
    const colorMap: Record<string, string> = {
      ritual: '#ef4444', // Red
      festival: '#f43f5e', // Rose
      nature: '#10b981', // Emerald
      artform: '#8b5cf6', // Violet
      history: '#a8a29e', // Stone
      food: '#f59e0b', // Amber
      person: '#3b82f6', // Blue
      community: '#06b6d4', // Cyan
      place: '#64748b', // Slate
      custom: '#f59e0b',
      default: '#94a3b8'
    };

    const color = colorMap[type] || colorMap.default;

    // SVG Paths (Simplified cultural icons)
    const paths: Record<string, string> = {
       // Ritual: Flame/Diya
       ritual: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.22-3.14-3.5-3.5a8.773 8.773 0 0 1 3.208 1.48L11 8.5l1.292-1.52A8.773 8.773 0 0 1 15.5 5.5c-1.28.36-2.428 1.357-3.5 3.5-.5 1-1 1.62-1 3a2.5 2.5 0 0 0 2.5 2.5c.348 0 .68-.073.978-.204l.208.76A6 6 0 1 1 8.5 14.5Z" fill="currentColor" stroke="none" />',
       
       // Festival: Starburst
       festival: '<path d="m12 3 2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>',
       
       // Nature: Leaf
       nature: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
       
       // Artform: Mask/Palette Style
       artform: '<path d="M2 12c0-4.4 3.6-8 8-8 3.5 0 6.5 2.2 7.6 5.4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M19 12c0 4.4-3.6 8-8 8-3.5 0-6.5-2.2-7.6-5.4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="10" cy="12" r="2" fill="currentColor"/>',
       
       // History: Scroll/Pillar
       history: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>',
       
       // Food: Bowl
       food: '<path d="M20 12h-4l-3 9H7l-3-9H2" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/><path d="M6 12C6 8 8 3 11 3s5 5 5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
       
       // Person: User
       person: '<circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/>',
       
       // Community: Users
       community: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" fill="none"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" fill="none"/>',
       
       // Place: MapPin
       place: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="10" r="3" fill="currentColor"/>',
       
       // Object: Cube
       object: '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 9h18M9 21V9" stroke="currentColor" stroke-width="2"/>',
       
       default: '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/>'
    };

    const svgContent = paths[type] || paths.default;
    
    // Construct SVG with a dark background circle for contrast
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#1e293b" stroke="${color}" stroke-width="1.5"/>
        <g transform="scale(0.55) translate(9.8, 9.8)" color="${color}">
          ${svgContent}
        </g>
      </svg>
    `.trim();

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  // Convert CulturalEvents to Graph Data
  const getGraphData = () => {
    const nodes: GraphNode[] = events.map(ev => {
        return {
            id: ev.id,
            label: ev.name,
            group: ev.type,
            value: Math.max(20, ev.preservation_score / 2), // Size scaled by preservation
            title: ev.significance,
            shape: 'image', // Use Image shape for Icons
            image: getIconForType(ev.type),
            color: {
               background: '#1e293b', // Fallback
               border: '#ffffff'
            }
        };
    });

    const edges: GraphEdge[] = [];
    
    events.forEach(ev => {
      ev.dna_relationships.forEach(rel => {
        const edgeId = `${ev.id}-${rel.targetId}`;
        
        // Only add if target exists in our events list
        if (events.some(e => e.id === rel.targetId)) {
            edges.push({
                from: ev.id,
                to: rel.targetId,
                width: rel.strength * 4,
                color: { 
                    opacity: rel.strength, 
                    color: rel.type === 'geographically_linked' ? '#94a3b8' : '#f59e0b' 
                },
                dashes: rel.type === 'geographically_linked',
                id: edgeId
            });
        }
      });
    });

    return { nodes, edges };
  };

  const graphData = useMemo(() => getGraphData(), [events]);

  // Initialize/Update Vis Network
  useEffect(() => {
    if (!containerRef.current) return;

    if (!networkRef.current) {
      const options = {
        nodes: {
          font: {
            color: '#e2e8f0',
            face: 'Playfair Display', // Cultural Serif
            size: 16,
            strokeWidth: 4,
            strokeColor: '#0f172a',
            vadjust: -5
          },
          borderWidth: 2,
          shadow: {
              enabled: true,
              color: 'rgba(0,0,0,0.6)',
              size: 15,
              x: 0,
              y: 5
          },
          // Global shape properties if needed, but we define per node
          shapeProperties: {
            useBorderWithImage: true,
            interpolation: true 
          }
        },
        edges: {
          color: { inherit: false },
          smooth: { 
            enabled: true,
            type: 'continuous',
            roundness: 0.5
          },
          arrows: {
              to: { enabled: true, scaleFactor: 0.5 } 
          }
        },
        physics: {
          stabilization: false,
          barnesHut: {
            gravitationalConstant: -3000,
            centralGravity: 0.1, // Looser gravity
            springLength: 200, // Longer springs for better separation
            springConstant: 0.02,
            damping: 0.09,
          },
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          zoomView: true
        }
      };

      networkRef.current = new Network(containerRef.current, graphData, options);

      networkRef.current.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          setSelectedNodeId(nodeId);
          onSelectNode(nodeId);
        } else {
          setSelectedNodeId(null);
        }
      });
      
      if (rootEventId) {
        // Initial fly-to
        setTimeout(() => {
           if (rootEventId && networkRef.current) { // Check again inside timeout
               const nodeExists = networkRef.current.body.data.nodes.get(rootEventId) !== null;
               if (nodeExists) {
                   networkRef.current.selectNodes([rootEventId]);
                   networkRef.current.focus(rootEventId, { scale: 1.0, animation: true });
                   setSelectedNodeId(rootEventId);
               }
           }
        }, 800);
      }
    } else {
      // Update data
      networkRef.current.setData(graphData);
    }
  }, [graphData, rootEventId]); // Re-run when graphData changes

  // Helper to normalize IDs
  const generateStableId = (name: string) => {
    const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return `gen_${cleanName}`;
  };

  const performDiscovery = async (term: string) => {
    setIsDiscovering(true);
    try {
      const result = await discoverTraditionConnections(term);
      
      if (!result || !result.rootNode) {
          console.error("Invalid discovery response", result);
          return;
      }
      
      // 1. Process New Nodes
      const newEvents: CulturalEvent[] = [];
      let rootId = result.rootNode.id || generateStableId(result.rootNode.name);

      // Check if root exists in global events (by ID or by Name to avoid duplicates)
      let rootEvent = events.find(e => e.id === rootId || e.name.toLowerCase() === result.rootNode.name.toLowerCase());
      
      if (rootEvent) {
          // If we found it by name but ID is different, update the ID we use for focus
          // and ensure we use the existing event's ID for relationships
          const originalId = rootId;
          rootId = rootEvent.id;
          
          // Update basic info if it was missing
          if (!rootEvent.description) rootEvent.description = result.rootNode.description;
          if (!rootEvent.significance) rootEvent.significance = result.rootNode.significance;
      } else {
          // Create Root Event
          rootEvent = {
              id: rootId,
              name: result.rootNode.name,
              type: result.rootNode.type || 'custom',
              category: 'Discovered',
              description: result.rootNode.description,
              significance: result.rootNode.significance,
              location: { lat: 10.85, lng: 76.27, region: 'Kerala' }, // Default location if unknown
              seasonal_markers: [],
              tags: ['discovered', 'ai-generated'],
              emotional_resonance: 'medium',
              preservation_score: result.rootNode.preservation_score || 50,
              related_traditions: [],
              dna_relationships: []
          };
          newEvents.push(rootEvent);
      }

      // Process Related Nodes
      if (result.relatedNodes && Array.isArray(result.relatedNodes)) {
        result.relatedNodes.forEach((node: any) => {
            const nodeId = node.id || generateStableId(node.name);
            
            // Check if node exists in global events (by ID or by Name)
            let existingNode = events.find(e => e.id === nodeId || e.name.toLowerCase() === node.name.toLowerCase());
            const finalNodeId = existingNode ? existingNode.id : nodeId;

            // Avoid duplicates in newEvents list and existing events
            if (!existingNode && !newEvents.find(ne => ne.id === finalNodeId)) {
                newEvents.push({
                    id: finalNodeId,
                    name: node.name,
                    type: node.type || 'custom',
                    category: 'Discovered',
                    description: node.description,
                    significance: node.significance,
                    location: { lat: 10.85 + (Math.random() - 0.5), lng: 76.27 + (Math.random() - 0.5), region: 'Global' },
                    seasonal_markers: [],
                    tags: ['discovered', 'connection'],
                    emotional_resonance: 'medium',
                    preservation_score: node.preservation_score || 50,
                    related_traditions: [],
                    dna_relationships: []
                });
            }

            // Create Relationship Object
            const relationship: Relationship = {
                targetId: finalNodeId,
                type: node.relationshipType || 'shares_root_with',
                strength: node.relationshipStrength || 0.5
            };

            // Add relationship to Root (check if exists first)
            if (!rootEvent!.dna_relationships.some(r => r.targetId === finalNodeId)) {
                rootEvent!.dna_relationships.push(relationship);
            }
            
            // Also ensure related_traditions string array is updated for legacy compat
            if (!rootEvent!.related_traditions.includes(finalNodeId)) {
                rootEvent!.related_traditions.push(finalNodeId);
            }
        });
      }

      // 2. Commit to Memory (Global State)
      if (newEvents.length > 0) {
          onAddEvents(newEvents);
      }
      
      // Update the root event specifically to save its new relationships
      if (rootEvent) {
          onUpdateEvent(rootEvent);
      }
      
      // 3. Focus on the subject
      setTimeout(() => {
        if (!networkRef.current) return;
        
        // Check if node exists in the network data before focusing
        const nodeExists = networkRef.current.body.data.nodes.get(rootId) !== null;
        
        if (nodeExists) {
            networkRef.current.selectNodes([rootId]);
            networkRef.current.focus(rootId, { scale: 1.0, animation: true });
            setSelectedNodeId(rootId);
        } else {
            // If not in network yet, it might be because the setData hasn't propagated.
            // We can try one more time or just select it in state
            setSelectedNodeId(rootId);
        }
      }, 800);

    } catch (error) {
      console.error("Failed to discover:", error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await performDiscovery(searchQuery);
    setSearchQuery('');
  };

  const handleExpandSelected = () => {
    if (!selectedNodeId) return;
    const node = events.find(n => n.id === selectedNodeId);
    if (node) {
        performDiscovery(node.name);
    }
  };
  
  const handleNodeJump = (id: string) => {
    setSelectedNodeId(id);
    if (networkRef.current) {
        const nodeExists = networkRef.current.body.data.nodes.get(id) !== null;
        if (nodeExists) {
            networkRef.current.selectNodes([id]);
            networkRef.current.focus(id, { scale: 1.0, animation: true });
        }
    }
    onSelectNode(id);
  };

  // Derive details for the selected node
  const selectedNode = useMemo(() => 
    events.find(n => n.id === selectedNodeId), 
  [selectedNodeId, events]);

  const connectedNodes = useMemo(() => {
    if (!selectedNodeId) return [];
    // Find all edges in the raw graph data that touch this ID
    const rels = events.flatMap(ev => 
       ev.dna_relationships.map(rel => ({ source: ev.id, target: rel.targetId, ...rel }))
    );

    const connections = rels.filter(r => r.source === selectedNodeId || r.target === selectedNodeId);
    
    return connections.map(c => {
        const neighborId = c.source === selectedNodeId ? c.target : c.source;
        const node = events.find(e => e.id === neighborId);
        return { node, rel: c };
    }).filter(x => x.node !== undefined) as { node: CulturalEvent, rel: any }[];

  }, [selectedNodeId, events]);

  return (
    <div className="fixed inset-0 z-[1500] bg-slate-900 flex flex-col">
      {/* Header Bar */}
      <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-slate-900/90 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-playfair text-white flex items-center gap-2">
            Cultural DNA <span className="text-amber-500 text-sm font-sans uppercase tracking-widest border border-amber-500/30 px-2 py-0.5 rounded-full">Explorer</span>
          </h2>
        </div>

        {/* Discovery Search */}
        <div className="flex-1 max-w-md flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative group w-full">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Map new connection (e.g., 'Harvest Rituals')..."
                className="w-full bg-slate-800/50 border border-white/10 rounded-full py-2 pl-10 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-slate-800 transition-all"
                disabled={isDiscovering}
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500 transition-colors" size={16} />
              
              <button 
                type="submit"
                disabled={!searchQuery.trim() || isDiscovering}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black rounded-full transition-all disabled:opacity-0"
              >
                {isDiscovering ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              </button>
            </form>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          <X size={24} />
        </button>
      </div>
      
      {/* Visualization Canvas */}
      <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 to-slate-900">
        <div ref={containerRef} className="absolute inset-0" />
        
        {/* Loading Overlay */}
        <AnimatePresence>
            {isDiscovering && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-amber-500/30 px-4 py-2 rounded-full flex items-center gap-3 shadow-xl z-20"
            >
                <Loader2 size={18} className="animate-spin text-amber-500" />
                <span className="text-sm text-amber-100">Consulting cultural archives...</span>
            </motion.div>
            )}
        </AnimatePresence>
        
        {/* Node Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-4 right-4 bottom-4 w-80 glass-panel rounded-xl shadow-2xl flex flex-col overflow-hidden z-20 border-l border-white/10"
            >
              {/* Panel Header */}
              <div className="p-5 border-b border-white/10 bg-black/20">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md border
                    ${selectedNode.type === 'ritual' ? 'text-red-400 border-red-500/30 bg-red-900/20' : 
                      selectedNode.type === 'nature' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-900/20' :
                      'text-amber-500 border-amber-500/30 bg-amber-500/5'}
                  `}>
                    {selectedNode.type}
                  </span>
                  <button 
                    onClick={() => setSelectedNodeId(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <h3 className="text-2xl font-playfair text-white leading-tight">{selectedNode.name}</h3>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                {/* Description */}
                <div className="text-sm text-gray-300 leading-relaxed font-light">
                  <Info size={14} className="inline-block mr-1 text-gray-500 mb-0.5" />
                  {selectedNode.significance || selectedNode.description || "No additional details available."}
                </div>

                {/* Metrics */}
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Vitality Score</span>
                      <span className="text-emerald-400 font-mono text-xs">{selectedNode.preservation_score}/100</span>
                   </div>
                   <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${selectedNode.preservation_score}%` }} />
                   </div>
                </div>

                {/* Connections List */}
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                    <Activity size={12} /> Connected Nodes ({connectedNodes.length})
                  </h4>
                  {connectedNodes.length > 0 ? (
                    <div className="space-y-2">
                      {connectedNodes.map(({ node, rel }) => (
                        <button
                          key={node.id}
                          onClick={() => handleNodeJump(node.id)}
                          className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 transition-all group flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm text-gray-200 group-hover:text-amber-400 font-medium transition-colors">
                              {node.name}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                              {node.type} 
                              {rel.type === 'geographically_linked' && <span className="ml-1 opacity-70">• Geo</span>}
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-gray-600 group-hover:text-amber-500" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic p-4 text-center border border-dashed border-gray-700 rounded-lg">
                      No connections mapped yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Panel Footer / Actions */}
              <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
                <button 
                  onClick={handleExpandSelected}
                  disabled={isDiscovering}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDiscovering ? <Loader2 size={16} className="animate-spin" /> : <GitBranch size={16} />}
                  <span>Expand Network</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 p-4 glass-panel rounded-lg max-w-xs pointer-events-none">
          <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Archetypes</h4>
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600 border border-red-400"></span> Ritual (Flame)</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-700 border border-violet-400"></span> Art (Mask)</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-700 border border-emerald-400"></div> Nature (Leaf)</div>
             <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-600 border border-amber-400"></span> Food (Bowl)</div>
          </div>
        </div>
      </div>
    </div>
  );
};