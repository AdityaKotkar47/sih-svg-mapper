import React, { useState, useRef, useCallback } from 'react';
import { useToast } from "../../hooks/use-toast";
import { SVGUploader } from './SVGUploader';
import { SVGDisplay } from './SVGDisplay';
import { DataDisplay } from './DataDisplay';
import { EmptyState } from './EmptyState';
import { Network, Trash2 } from "lucide-react";

export default function SVGModifier() {
  const { toast } = useToast();
  const [svgContent, setSvgContent] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedVertices, setSelectedVertices] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const svgRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setSvgContent(content);
        
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(content, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        
        const width = svgElement.getAttribute('width') || svgElement.viewBox?.baseVal?.width || 800;
        const height = svgElement.getAttribute('height') || svgElement.viewBox?.baseVal?.height || 600;
        
        setSvgDimensions({ 
          width: typeof width === 'string' ? parseInt(width) : width,
          height: typeof height === 'string' ? parseInt(height) : height
        });
      };
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: "Error uploading SVG",
        description: "Please ensure you've selected a valid SVG file.",
        variant: "destructive",
      });
    }
  };

  const handleJsonInput = () => {
    try {
      const jsonData = prompt('Please paste your JSON data:');
      if (!jsonData) return;

      const parsedData = JSON.parse(jsonData);
      if (parsedData.vertices && parsedData.edges) {
        setVertices(parsedData.vertices);
        setEdges(parsedData.edges);
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${parsedData.vertices.length} vertices and ${parsedData.edges.length} edges.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Please ensure your JSON data is valid.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setSvgContent('');
    setSvgDimensions({ width: 0, height: 0 });
    setVertices([]);
    setEdges([]);
    setSelectedVertices([]);
    setSelectedEdges([]);
  };

  const handleVertexClick = useCallback((vertexId) => {
    console.log('Vertex clicked:', vertexId);
    setSelectedVertices(prev => {
      const isSelected = prev.includes(vertexId);
      if (isSelected) {
        return prev.filter(id => id !== vertexId);
      }
      return [...prev, vertexId];
    });
  }, []);

  const handleEdgeClick = useCallback((edgeId) => {
    console.log('Edge clicked:', edgeId);
    setSelectedEdges(prev => {
      const isSelected = prev.includes(edgeId);
      if (isSelected) {
        return prev.filter(id => id !== edgeId);
      }
      return [...prev, edgeId];
    });
  }, []);

  const handleDelete = () => {
    // Delete selected edges first
    setEdges(prev => prev.filter(edge => !selectedEdges.includes(edge.id)));
    
    // Delete selected vertices and their connected edges
    setVertices(prev => prev.filter(vertex => !selectedVertices.includes(vertex.id)));
    setEdges(prev => prev.filter(edge => 
      !selectedVertices.includes(edge.source) && 
      !selectedVertices.includes(edge.target)
    ));

    // Clear selections
    setSelectedVertices([]);
    setSelectedEdges([]);

    toast({
      title: "Items deleted",
      description: `Deleted ${selectedVertices.length} vertices and ${selectedEdges.length} edges.`,
    });
  };

  const handleExportJson = () => {
    const data = {
      vertices,
      edges
    };
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    toast({
      title: "JSON Copied",
      description: "The modified data has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Network className="w-6 h-6" />
          SVG Vertex Mapper - Modify Existing Data
        </h1>
        
        {!svgContent ? (
          <div className="flex flex-col gap-4 items-center">
            <EmptyState />
            <SVGUploader
              onFileUpload={handleFileUpload}
              onClear={handleClear}
              hasSVG={!!svgContent}
            />
            <button
              onClick={handleJsonInput}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Load Existing Data
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleDelete}
                disabled={selectedVertices.length + selectedEdges.length === 0}
                className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
                  selectedVertices.length + selectedEdges.length > 0
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                Delete Selected ({selectedVertices.length + selectedEdges.length})
              </button>
              <button
                onClick={handleExportJson}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Export Modified Data
              </button>
            </div>
            <SVGDisplay
              svgContent={svgContent}
              svgRef={svgRef}
              vertices={vertices}
              edges={edges}
              selectedVertices={selectedVertices}
              selectedEdges={selectedEdges}
              handleVertexClick={handleVertexClick}
              handleEdgeClick={handleEdgeClick}
              svgDimensions={svgDimensions}
            />
            <DataDisplay vertices={vertices} edges={edges} />
          </>
        )}
      </div>
    </div>
  );
} 