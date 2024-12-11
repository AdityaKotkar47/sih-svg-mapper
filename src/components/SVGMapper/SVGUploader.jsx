import React, { useRef } from 'react';
import { Input } from "../ui/input/input";
import { Button } from "../ui/button/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip/tooltip";
import { Trash2 } from "lucide-react";

export const SVGUploader = ({ onFileUpload, onClear, hasSVG }) => {
  const inputRef = useRef(null);

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClear();
  };

  return (
    <div className="mb-6 flex items-center space-x-4">
      <Input 
        ref={inputRef}
        type="file" 
        accept=".svg" 
        onChange={(e) => onFileUpload(e.target.files[0])} 
        className="flex-grow"
        placeholder="Upload SVG Floor Plan"
      />
      {hasSVG && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={handleClear}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Floor Plan</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};