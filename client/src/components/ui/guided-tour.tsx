import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DirectionArrow, ArrowGuide } from "@/components/ui/direction-arrow";
import { X } from "lucide-react";

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  direction?: "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right";
  placement?: "top" | "bottom" | "left" | "right";
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  storageKey?: string;
}

export function GuidedTour({
  steps,
  onComplete,
  onSkip,
  isOpen: externalIsOpen,
  onOpenChange,
  storageKey = "guided-tour-completed"
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // Control open state (internal or external)
  const open = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setIsOpen(value);
    }
  };
  
  // Check if tour has been completed before
  useEffect(() => {
    if (externalIsOpen === undefined) {
      const completed = localStorage.getItem(storageKey) === "true";
      if (!completed) {
        setIsOpen(true);
      }
    }
  }, [storageKey, externalIsOpen]);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollToTarget(steps[currentStep + 1].targetId);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollToTarget(steps[currentStep - 1].targetId);
    }
  };
  
  const handleSkip = () => {
    setOpen(false);
    if (onSkip) onSkip();
    localStorage.setItem(storageKey, "true");
  };
  
  const handleComplete = () => {
    setOpen(false);
    if (onComplete) onComplete();
    localStorage.setItem(storageKey, "true");
  };
  
  const scrollToTarget = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };
  
  // Scroll to the current target when step changes
  useEffect(() => {
    if (open && steps[currentStep]) {
      scrollToTarget(steps[currentStep].targetId);
    }
  }, [currentStep, open, steps]);
  
  if (!open || steps.length === 0) return null;
  
  const currentTourStep = steps[currentStep];
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={handleSkip} />
      
      {/* Direction Arrow */}
      <ArrowGuide
        targetId={currentTourStep.targetId}
        direction={currentTourStep.direction || "down"}
        color="text-indigo-500"
        size="lg"
        animated={true}
      />
      
      {/* Tour Card */}
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-xl p-4 max-w-sm"
        style={{
          ...getPlacementStyles(currentTourStep.targetId, currentTourStep.placement || "bottom")
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{currentTourStep.title}</h3>
          <Button variant="ghost" size="sm" onClick={handleSkip} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-gray-700 mb-4">{currentTourStep.content}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 w-5 rounded-full ${
                  index === currentStep ? "bg-indigo-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? "Next" : "Finish"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to position the tour card relative to the target element
function getPlacementStyles(targetId: string, placement: "top" | "bottom" | "left" | "right") {
  const element = document.getElementById(targetId);
  if (!element) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  
  const rect = element.getBoundingClientRect();
  const margin = 20; // Distance from the target element
  
  switch (placement) {
    case "top":
      return {
        bottom: `${window.innerHeight - rect.top + margin}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: "translateX(-50%)"
      };
    case "bottom":
      return {
        top: `${rect.bottom + margin}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: "translateX(-50%)"
      };
    case "left":
      return {
        top: `${rect.top + rect.height / 2}px`,
        right: `${window.innerWidth - rect.left + margin}px`,
        transform: "translateY(-50%)"
      };
    case "right":
      return {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + margin}px`,
        transform: "translateY(-50%)"
      };
    default:
      return {
        top: `${rect.bottom + margin}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: "translateX(-50%)"
      };
  }
}