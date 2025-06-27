import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ArrowDirection = "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right";

interface DirectionArrowProps {
  direction?: ArrowDirection;
  label?: string;
  tooltip?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  animated?: boolean;
  onClick?: () => void;
}

export function DirectionArrow({
  direction = "down",
  label,
  tooltip,
  className,
  size = "md",
  color = "text-indigo-500",
  animated = true,
  onClick,
}: DirectionArrowProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Map size to Tailwind classes
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  // Map direction to rotation classes
  const rotationClasses = {
    up: "rotate-180",
    down: "rotate-0",
    left: "-rotate-90",
    right: "rotate-90",
    "up-left": "-rotate-135",
    "up-right": "rotate-135",
    "down-left": "-rotate-45",
    "down-right": "rotate-45",
  };

  // Animation classes
  const animationClass = animated ? "transition-transform duration-300" : "";
  const hoverAnimationClass = animated && isHovering ? "scale-125" : "";

  const arrow = (
    <div
      className={cn(
        "flex flex-col items-center justify-center cursor-pointer",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={cn(
          "transform",
          rotationClasses[direction],
          animationClass,
          hoverAnimationClass
        )}
      >
        <svg
          className={cn(sizeClasses[size], color)}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
      {label && (
        <span className={cn("text-sm mt-1", color)}>{label}</span>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{arrow}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return arrow;
}

export function CurvedArrow({
  startX,
  startY,
  endX,
  endY,
  color = "stroke-indigo-500",
  thickness = 2,
  animated = true,
  label,
  tooltip,
  className,
}: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color?: string;
  thickness?: number;
  animated?: boolean;
  label?: string;
  tooltip?: string;
  className?: string;
}) {
  const [isHovering, setIsHovering] = useState(false);
  
  // Calculate control points for a quadratic curve
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const controlX = midX + (endY - startY) * 0.5;
  const controlY = midY - (endX - startX) * 0.5;
  
  // Calculate path
  const path = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  
  // Calculate position for arrowhead
  const dx = endX - controlX;
  const dy = endY - controlY;
  const angle = Math.atan2(dy, dx);
  
  // Calculate arrowhead points
  const arrowLength = 10;
  const arrowWidth = 6;
  const arrowX1 = endX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle);
  const arrowY1 = endY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle);
  const arrowX2 = endX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle);
  const arrowY2 = endY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle);
  
  // Animation classes
  const animationClass = animated ? "transition-all duration-300" : "";
  const hoverAnimationClass = animated && isHovering ? "stroke-width-[3]" : "";
  
  // Calculate label position
  const labelX = midX;
  const labelY = midY - 10;
  
  const arrow = (
    <svg
      className={cn("absolute pointer-events-none", className)}
      width="100%"
      height="100%"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <path
        d={path}
        fill="none"
        className={cn(color, animationClass, hoverAnimationClass)}
        strokeWidth={thickness}
        strokeDasharray={animated ? "5,5" : "none"}
      />
      <polygon
        points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        className={color}
      />
      {label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          className="fill-current text-xs font-medium"
        >
          {label}
        </text>
      )}
    </svg>
  );
  
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{arrow}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return arrow;
}

export function ArrowGuide({
  targetId,
  direction = "down",
  offset = 10,
  label,
  tooltip,
  color = "text-indigo-500",
  size = "md",
  animated = true,
  className,
}: {
  targetId: string;
  direction?: ArrowDirection;
  offset?: number;
  label?: string;
  tooltip?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  React.useEffect(() => {
    const updatePosition = () => {
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;
      
      const rect = targetElement.getBoundingClientRect();
      let top = 0;
      let left = 0;
      
      switch (direction) {
        case "up":
          top = rect.top - offset;
          left = rect.left + rect.width / 2;
          break;
        case "down":
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - offset;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + offset;
          break;
        case "up-left":
          top = rect.top - offset;
          left = rect.left - offset;
          break;
        case "up-right":
          top = rect.top - offset;
          left = rect.right + offset;
          break;
        case "down-left":
          top = rect.bottom + offset;
          left = rect.left - offset;
          break;
        case "down-right":
          top = rect.bottom + offset;
          left = rect.right + offset;
          break;
      }
      
      setPosition({ top, left });
    };
    
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [targetId, direction, offset]);
  
  return (
    <div
      className={cn(
        "fixed z-50 transform -translate-x-1/2 -translate-y-1/2",
        className
      )}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <DirectionArrow
        direction={direction}
        label={label}
        tooltip={tooltip}
        color={color}
        size={size}
        animated={animated}
      />
    </div>
  );
}