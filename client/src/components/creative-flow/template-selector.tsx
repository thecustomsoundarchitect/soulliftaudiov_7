import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Sparkles } from "lucide-react";
import { 
  PromptTemplate, 
  TemplateFilters, 
  getAllPromptTemplates,
  getFilteredPromptTemplates,
  getRandomPromptTemplate,
  getTemplateFilterOptions 
} from "@/services/promptTemplateService";

interface TemplateSelectorProps {
  onTemplateSelect: (template: PromptTemplate) => void;
  selectedTemplate?: PromptTemplate | null;
  recipientName?: string;
  anchor?: string;
}

export default function TemplateSelector({ 
  onTemplateSelect, 
  selectedTemplate,
  recipientName,
  anchor 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [filterOptions, setFilterOptions] = useState<{
    tones: string[];
    relationships: string[];
    occasions: string[];
  }>({ tones: [], relationships: [], occasions: [] });

  // Load templates and filter options
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [allTemplates, options] = await Promise.all([
        getAllPromptTemplates(),
        getTemplateFilterOptions()
      ]);
      
      setTemplates(allTemplates);
      setFilteredTemplates(allTemplates);
      setFilterOptions(options);
      setLoading(false);
    }
    
    loadData();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    async function applyFilters() {
      if (Object.keys(filters).length === 0) {
        setFilteredTemplates(templates);
      } else {
        const filtered = await getFilteredPromptTemplates(filters);
        setFilteredTemplates(filtered);
      }
    }
    
    if (templates.length > 0) {
      applyFilters();
    }
  }, [filters, templates]);

  const handleFilterChange = (type: keyof TemplateFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value === 'all' ? undefined : value
    }));
  };

  const handleRandomTemplate = async () => {
    const randomTemplate = await getRandomPromptTemplate(filters);
    if (randomTemplate) {
      onTemplateSelect(randomTemplate);
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return (
      <Card className="bg-white/10 border-white/20 text-white">
        <CardContent className="p-6">
          <div className="text-center">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Emotional Prompt Templates
        </CardTitle>
        <p className="text-white/80 text-sm">
          Choose a template to guide your message creation, or let AI surprise you
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select onValueChange={(value) => handleFilterChange('tone', value)}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Any Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Tone</SelectItem>
              {filterOptions.tones.map(tone => (
                <SelectItem key={tone} value={tone}>{tone}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => handleFilterChange('relationship', value)}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Any Relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Relationship</SelectItem>
              {filterOptions.relationships.map(rel => (
                <SelectItem key={rel} value={rel}>{rel}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => handleFilterChange('occasion', value)}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Any Occasion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Occasion</SelectItem>
              {filterOptions.occasions.map(occ => (
                <SelectItem key={occ} value={occ}>{occ}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleRandomTemplate}
            variant="outline" 
            className="flex-1 bg-purple-600/20 border-purple-400/50 hover:bg-purple-600/30"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Surprise Me
          </Button>
          
          {Object.keys(filters).length > 0 && (
            <Button 
              onClick={clearFilters}
              variant="outline"
              className="bg-white/20 border-white/30 hover:bg-white/30"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Template Grid */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center text-white/60 py-4">
              No templates match your filters. Try broadening your search.
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => onTemplateSelect(template)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'bg-purple-600/30 border-purple-400'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                      {template.tone}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                      {template.relationship}
                    </Badge>
                    <Badge variant="secondary" className="bg-orange-600/20 text-orange-300">
                      {template.occasion}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-white/80 line-clamp-2">
                  {template.template}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Selected Template Preview */}
        {selectedTemplate && (
          <div className="mt-4 p-3 bg-purple-600/20 border border-purple-400/50 rounded-lg">
            <div className="text-sm font-medium text-purple-300 mb-1">Selected Template:</div>
            <div className="flex gap-2 mb-2">
              <Badge variant="secondary" className="bg-purple-600/30 text-purple-200">
                {selectedTemplate.tone}
              </Badge>
              <Badge variant="secondary" className="bg-purple-600/30 text-purple-200">
                {selectedTemplate.relationship}
              </Badge>
              <Badge variant="secondary" className="bg-purple-600/30 text-purple-200">
                {selectedTemplate.occasion}
              </Badge>
            </div>
            <p className="text-xs text-white/70">
              {selectedTemplate.template}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}