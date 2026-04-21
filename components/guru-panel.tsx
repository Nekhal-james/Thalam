import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, MessageSquare } from 'lucide-react';
import { streamGuruInsight } from '../services/guru';
import { CulturalEvent } from '../lib/types';

interface GuruInterfaceProps {
  selectedEvent?: CulturalEvent;
}

export const GuruInterface: React.FC<GuruInterfaceProps> = ({ selectedEvent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [history, setHistory] = useState<{role: 'user'|'model', text: string}[]>([]);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response, history, isOpen]);

  const handleInvoke = async () => {
    if (!query.trim() && !selectedEvent) return;
    
    const userQ = query || `Tell me about the cultural significance of ${selectedEvent?.name || 'this region'}.`;
    
    setHistory(prev => [...prev, { role: 'user', text: userQ }]);
    setQuery('');
    setResponse('');
    setIsStreaming(true);

    try {
      const resultStream = await streamGuruInsight(userQ, selectedEvent);
      
      let fullText = '';
      for await (const chunk of resultStream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setResponse(prev => prev + text);
        }
      }
      
      setHistory(prev => [...prev, { role: 'model', text: fullText }]);
      setResponse('');
    } catch (err) {
      setResponse('Guru is meditating and cannot respond right now. Please check your connection.');
    } finally {
      setIsStreaming(false);
    }
  };

  const SuggestionPill = ({ text }: { text: string }) => (
    <button 
      onClick={() => { setQuery(text); }}
      className="px-3 py-1.5 text-xs text-amber-200/70 bg-amber-900/20 border border-amber-500/20 rounded-full hover:bg-amber-900/40 hover:border-amber-500/40 transition-all text-left truncate max-w-full"
    >
      {text}
    </button>
  );

  return (
    <>
      {/* Floating Orb */}
      <motion.div 
        className="fixed bottom-6 right-6 z-[2000]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className={`
            w-14 h-14 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] 
            flex items-center justify-center transition-all duration-500
            ${isOpen ? 'bg-amber-500 text-black rotate-90 scale-0 opacity-0' : 'bg-gradient-to-br from-gray-800 to-black border border-amber-500/50 text-amber-500'}
          `}
        >
          <Sparkles size={24} />
        </button>
      </motion.div>

      {/* Main Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] z-[2001] glass-panel border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black">
                  <Sparkles size={16} fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-playfair text-xl text-white">Guru</h3>
                  <p className="text-xs text-amber-500/60 uppercase tracking-widest">Cultural Intelligence</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4 opacity-70">
                  <Sparkles size={48} strokeWidth={1} />
                  <p className="font-light max-w-xs">I am Guru. I can analyze traditions, explain rituals, and connect cultural threads.</p>
                  
                  {selectedEvent && (
                    <div className="flex flex-col gap-2 w-full mt-4">
                      <SuggestionPill text={`What is the origin of ${selectedEvent.name}?`} />
                      <SuggestionPill text={`How does ${selectedEvent.name} relate to nature?`} />
                    </div>
                  )}
                </div>
              )}

              {history.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-amber-500/10 text-amber-100 rounded-tr-none border border-amber-500/20' 
                      : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'}
                  `}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-sm leading-relaxed text-gray-300 animate-pulse">
                     {response || <span className="flex gap-1"><span className="w-1 h-1 bg-gray-500 rounded-full"/> <span className="w-1 h-1 bg-gray-500 rounded-full"/></span>}
                  </div>
                </div>
              )}
              
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black/20">
               <div className="relative">
                 <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInvoke()}
                    placeholder="Ask Guru..."
                    className="w-full bg-black/40 border border-white/10 rounded-full py-3 px-5 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                 />
                 <button 
                  onClick={handleInvoke}
                  disabled={isStreaming || (!query && !selectedEvent)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   <ChevronRight size={16} />
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};