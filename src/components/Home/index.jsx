import React from 'react';
import { Network, Edit } from "lucide-react";

export const Home = ({ onModeSelect }) => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center gap-8 min-h-[80vh] justify-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Network className="w-8 h-8" />
          SVG Vertex Mapper
        </h1>
        
        <div className="flex gap-4">
          <button
            onClick={() => onModeSelect('new')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-lg"
          >
            <Network className="w-5 h-5" />
            Create New Mapping
          </button>
          
          <button
            onClick={() => onModeSelect('modify')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-lg"
          >
            <Edit className="w-5 h-5" />
            Modify Existing Data
          </button>
        </div>
      </div>
    </div>
  );
}; 