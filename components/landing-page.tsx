import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Sparkles, Plus, Leaf } from 'lucide-react';
import { CulturalEvent } from '../lib/types';

interface LandingPageProps {
  onEnter: () => void;
  onAddEvent: (event: CulturalEvent) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onAddEvent }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as const,
    description: '',
    region: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new event object
    // Note: In a real app, we'd use a geocoding API for the region. 
    // Here we randomize slightly around Kerala center for demo visualization.
    const newEvent: CulturalEvent = {
      id: `custom_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      category: 'User Contribution',
      location: {
        lat: 10.8505 + (Math.random() - 0.5) * 1.5,
        lng: 76.2711 + (Math.random() - 0.5) * 1.0,
        region: formData.region || 'Kerala, India'
      },
      description: formData.description,
      significance: 'User contributed cultural marker.',
      seasonal_markers: ['Year-round'],
      related_traditions: [],
      tags: ['user-contributed', 'local'],
      emotional_resonance: 'medium',
      preservation_score: 100, // New entries assumed alive
      dna_relationships: []
    };

    onAddEvent(newEvent);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setFormData({ name: '', type: 'custom', description: '', region: '' });
    }, 2000);
  };

  return (
    <div className="relative w-full h-screen bg-[#0f1115] text-white overflow-hidden flex flex-col items-center justify-center z-[2000]">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/20 rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full px-6 flex flex-col md:flex-row gap-12 items-center">
        
        {/* Left Side: Hero Text */}
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-amber-500/80">
              <Sparkles size={16} />
              <span className="text-xs font-sans uppercase tracking-[0.3em]">Project Thalam</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-playfair mb-6 leading-tight">
              Visualizing <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Living Traditions</span>
            </h1>
            
            <p className="text-gray-400 font-light text-lg mb-8 max-w-md mx-auto md:mx-0">
              A dynamic cultural intelligence system mapping the hidden rhythms, rituals, and interconnected heritage of Kerala.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={onEnter}
                className="group relative px-8 py-4 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-full transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Archive</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => setShowForm(!showForm)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span>Pin Culture</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Interactive Form or Visual */}
        <motion.div 
          className="flex-1 w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {showForm ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-8 rounded-2xl border border-amber-500/30 relative overflow-hidden"
            >
              {submitted ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 z-20 text-center p-6">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4"
                  >
                    <Leaf size={32} />
                  </motion.div>
                  <h3 className="text-xl font-playfair text-white">Contribution Pinned</h3>
                  <p className="text-gray-400 text-sm mt-2">Your addition is now part of the living map.</p>
                </div>
              ) : null}

              <h3 className="text-2xl font-playfair text-white mb-6 flex items-center gap-2">
                <MapPin className="text-amber-500" /> Pin Tradition
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Tradition Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Village Temple Festival"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Region</label>
                      <input 
                        type="text" 
                        value={formData.region}
                        onChange={e => setFormData({...formData, region: e.target.value})}
                        placeholder="e.g. Kasaragod"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                      />
                   </div>
                   <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Type</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-500/50 focus:outline-none transition-colors appearance-none"
                      >
                        <option value="custom">Custom</option>
                        <option value="ritual">Ritual</option>
                        <option value="festival">Festival</option>
                        <option value="artform">Art Form</option>
                      </select>
                   </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Briefly describe the significance..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-500/50 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button type="submit" className="w-full py-3 bg-amber-600/20 hover:bg-amber-600 text-amber-500 hover:text-black border border-amber-600/50 rounded-lg transition-all font-medium mt-2">
                  Add to Map
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="relative h-[400px] flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
               {/* Decorative Abstract Map Visualization */}
               <div className="grid grid-cols-3 gap-4 opacity-30 rotate-12 scale-75 md:scale-100">
                  {[...Array(9)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 + 1 }}
                      className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10"
                    />
                  ))}
               </div>
               <div className="absolute text-center">
                 <p className="text-sm text-gray-500 font-mono">
                   {/* Decorative data stream */}
                   Scanning... <br/>
                   Lat: 10.8505 N <br/>
                   Lng: 76.2711 E
                 </p>
               </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};