import React from 'react';
import { MapPin, GitGraph } from "lucide-react";

export const DataDisplay = ({ vertices, edges }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl mb-2 font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Vertices ({vertices.length})
        </h2>
        <pre className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto border text-sm">
          {JSON.stringify(vertices, null, 2)}
        </pre>
      </div>
      
      <div>
        <h2 className="text-xl mb-2 font-semibold flex items-center gap-2">
          <GitGraph className="h-5 w-5 text-green-600" />
          Edges ({edges.length})
        </h2>
        <pre className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto border text-sm">
          {JSON.stringify(edges, null, 2)}
        </pre>
      </div>
    </div>
  );
};