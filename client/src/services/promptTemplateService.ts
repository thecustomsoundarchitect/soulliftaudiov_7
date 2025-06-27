import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PromptTemplate {
  id: string;
  tone: string;
  relationship: string;
  occasion: string;
  template: string;
}

export interface TemplateFilters {
  tone?: string;
  relationship?: string;
  occasion?: string;
}

/**
 * Fetch all prompt templates from Firestore
 */
export async function getAllPromptTemplates(): Promise<PromptTemplate[]> {
  try {
    const templatesRef = collection(db, 'promptPresets');
    const snapshot = await getDocs(templatesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromptTemplate));
  } catch (error) {
    console.error('Error fetching prompt templates:', error);
    return [];
  }
}

/**
 * Fetch prompt templates filtered by criteria
 */
export async function getFilteredPromptTemplates(filters: TemplateFilters): Promise<PromptTemplate[]> {
  try {
    const templatesRef = collection(db, 'promptPresets');
    let q = query(templatesRef);
    
    // Apply filters
    if (filters.tone) {
      q = query(q, where('tone', '==', filters.tone));
    }
    if (filters.relationship) {
      q = query(q, where('relationship', '==', filters.relationship));
    }
    if (filters.occasion) {
      q = query(q, where('occasion', '==', filters.occasion));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromptTemplate));
  } catch (error) {
    console.error('Error fetching filtered templates:', error);
    return [];
  }
}

/**
 * Get a random prompt template based on optional filters
 */
export async function getRandomPromptTemplate(filters?: TemplateFilters): Promise<PromptTemplate | null> {
  try {
    const templates = filters 
      ? await getFilteredPromptTemplates(filters)
      : await getAllPromptTemplates();
    
    if (templates.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  } catch (error) {
    console.error('Error getting random template:', error);
    return null;
  }
}

/**
 * Get unique values for filter dropdowns
 */
export async function getTemplateFilterOptions(): Promise<{
  tones: string[];
  relationships: string[];
  occasions: string[];
}> {
  try {
    const templates = await getAllPromptTemplates();
    
    const tones = Array.from(new Set(templates.map(t => t.tone))).sort();
    const relationships = Array.from(new Set(templates.map(t => t.relationship))).sort();
    const occasions = Array.from(new Set(templates.map(t => t.occasion))).sort();
    
    return { tones, relationships, occasions };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return { tones: [], relationships: [], occasions: [] };
  }
}