import React from 'react';
import { AlertCircle } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="text-center py-12 bg-gray-100 rounded-lg">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-600 text-lg">
        Please upload an SVG floor plan to get started
      </p>
    </div>
  );
};