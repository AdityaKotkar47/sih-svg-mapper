import React from 'react';
import { Button } from "../ui/button/button";
import { Link2, Check, Trash2, Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip/tooltip";

export const ActionButtons = ({
  currentStage,
  setCurrentStage,
  vertices,
  onConfirmEdge,
  selectedEdgeVertices,
  onReset,
  onCopyJSON,
  isCopying,
  hasEdges
}) => {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-center">
      <div className="space-x-4">
        {currentStage === 'vertices' ? (
          <Button 
            onClick={() => setCurrentStage('edges')}
            disabled={vertices.length < 2}
            className="bg-green-600 hover:bg-green-700"
          >
            <Link2 className="mr-2 h-5 w-5" />
            Proceed to Edges
          </Button>
        ) : (
          <>
            <Button 
              onClick={onConfirmEdge}
              disabled={selectedEdgeVertices.length !== 2}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Check className="mr-2 h-5 w-5" />
              Confirm Edge
            </Button>
            <Button 
              onClick={() => setCurrentStage('vertices')}
              variant="secondary"
            >
              Back to Vertices
            </Button>
          </>
        )}
        
        <Button 
          variant="destructive" 
          onClick={onReset}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Reset {currentStage === 'vertices' ? 'All' : 'Selection'}
        </Button>
      </div>

      {vertices.length > 0 && hasEdges && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onCopyJSON}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isCopying}
              >
                {isCopying ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copy Full JSON
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isCopying ? 'JSON copied to clipboard!' : 'Copy vertex and edge data'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};