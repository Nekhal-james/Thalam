export interface CulturalEvent {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    region: string;
  };
  type: 'ritual' | 'festival' | 'artform' | 'custom' | 'nature' | 'history' | 'place' | 'person' | 'community' | 'object';
  category: string; // Specific category from PDF (e.g., "Shadow Puppetry", "Martial Art", "Tribal Ritual")
  description: string;
  significance: string;
  seasonal_markers: string[]; // e.g., "Monsoon", "Harvest", "April-May"
  related_traditions: string[]; // IDs of related events
  tags: string[];
  emotional_resonance: 'high' | 'medium' | 'low';
  preservation_score: number; // 0-100
  dna_relationships: Relationship[];
}

export interface Relationship {
  targetId: string;
  type: 'influenced_by' | 'derivative_of' | 'shares_root_with' | 'geographically_linked';
  strength: number; // 0-1
}

export interface Tradition {
  id: string;
  name: string;
  description: string;
}

export type ViewMode = 'LANDING' | 'PULSE_MAP' | 'DNA_EXPLORER' | 'TREND_HARMONICS';