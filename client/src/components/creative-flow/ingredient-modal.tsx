import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  promptText: string;
}

export default function IngredientModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  promptText 
}: IngredientModalProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
    setContent("");
  };

  const handleClose = () => {
    setContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-morphism border-white/50 max-w-lg">
        <DialogHeader className="text-center mb-6">
          <i className="fas fa-lightbulb text-yellow-500 text-3xl mb-3"></i>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {promptText}
          </DialogTitle>
          <p className="text-slate-600 mt-2">Let your thoughts flow freely...</p>
        </DialogHeader>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-40 p-4 glass-secondary border-slate-300/70 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
          placeholder="Share your authentic thoughts and memories..."
          autoFocus
        />
        
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            onClick={handleClose}
            variant="secondary"
            className="bg-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-all"
          >
            <i className="fas fa-times mr-2"></i>Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            <i className="fas fa-plus mr-2"></i>Add Ingredient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
