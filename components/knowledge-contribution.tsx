import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle, Loader2, X, FileType, Sparkles } from 'lucide-react';
import { analyzeCulturalSourceMaterial } from '../services/guru';
import { CulturalEvent } from '../lib/types';

interface KnowledgeContributionProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: (event: CulturalEvent) => void;
}

export const KnowledgeContribution: React.FC<KnowledgeContributionProps> = ({ isOpen, onClose, onEventAdded }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        setSelectedFile(file);
        setStatus('idle');
      } else {
        setStatus('error');
        setStatusMessage('Only PDF and Text files are supported.');
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (activeTab === 'text' && !textInput.trim()) return;
    if (activeTab === 'file' && !selectedFile) return;

    setIsAnalyzing(true);
    setStatus('idle');
    setStatusMessage('');

    try {
      let fileData = null;
      let textContent = null;

      if (activeTab === 'file' && selectedFile) {
        const base64 = await convertFileToBase64(selectedFile);
        fileData = { mimeType: selectedFile.type, data: base64 };
      } else {
        textContent = textInput;
      }

      const eventData = await analyzeCulturalSourceMaterial(textContent, fileData);

      // Add generated ID
      const newEvent: CulturalEvent = {
        ...eventData,
        id: `upl_${Date.now()}`,
        related_traditions: [],
        dna_relationships: []
      };

      onEventAdded(newEvent);
      setStatus('success');
      setStatusMessage(`Successfully mapped "${newEvent.name}" to ${newEvent.location.region}.`);
      
      // Reset form after delay
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setTextInput('');
        setSelectedFile(null);
      }, 2500);

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setStatusMessage(error.message || "Failed to analyze content. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg glass-panel rounded-2xl overflow-hidden shadow-2xl border border-amber-500/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
              <div>
                <h3 className="text-xl font-playfair text-white flex items-center gap-2">
                  <Upload size={20} className="text-amber-500" />
                  Contribute Knowledge
                </h3>
                <p className="text-xs text-gray-400 mt-1">Upload research or text. AI validates & maps it.</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button 
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'text' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Raw Text
              </button>
              <button 
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'file' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Upload Document
              </button>
            </div>

            {/* Content */}
            <div className="p-6 bg-[#0f1115]">
              {activeTab === 'text' ? (
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste article text, field notes, or descriptions here..."
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50 resize-none placeholder-gray-600"
                />
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all
                    ${selectedFile ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
                  `}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf,.txt" 
                    className="hidden" 
                  />
                  {selectedFile ? (
                    <div className="text-center">
                      <FileText size={32} className="mx-auto mb-2 text-amber-500" />
                      <p className="text-sm text-white font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <FileType size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Click to upload PDF or TXT</p>
                      <p className="text-xs mt-1 opacity-50">Max 5MB</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Message */}
              <AnimatePresence>
                {status !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-3 border ${
                      status === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200' : 'bg-red-900/20 border-red-500/30 text-red-200'
                    }`}
                  >
                    {status === 'success' ? <Check size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                    <span>{statusMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing || (activeTab === 'text' && !textInput) || (activeTab === 'file' && !selectedFile)}
                className="w-full mt-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Validating & Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Process & Add to Map
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};