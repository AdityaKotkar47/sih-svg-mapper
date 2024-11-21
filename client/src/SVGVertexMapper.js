import React, { useState, useRef } from 'react';
import { Button } from "./components/ui/button/button";
import { Input } from "./components/ui/input/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip/tooltip";
import { useToast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";
import { MapPin, Network, GitGraph, Trash2, Link2, Check, Copy, AlertCircle } from "lucide-react";

function SVGVertexMapper() {
  const { toast } = useToast();
  const [svgContent, setSvgContent] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);
  const [currentStage, setCurrentStage] = useState('vertices');
  const [selectedEdgeVertices, setSelectedEdgeVertices] = useState([]);
  const svgRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgString = e.target.result;
      setSvgContent(svgString);

      // Create a temporary SVG to get its dimensions
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgString;
      const svgElement = tempDiv.querySelector('svg');
      
      const width = svgElement.getAttribute('width') 
        ? parseFloat(svgElement.getAttribute('width')) 
        : svgElement.viewBox.baseVal.width;
      
      const height = svgElement.getAttribute('height') 
        ? parseFloat(svgElement.getAttribute('height')) 
        : svgElement.viewBox.baseVal.height;

      setSvgDimensions({ width, height });
    };
    reader.readAsText(file);
  };

  const calculateSVGCoordinates = (event) => {
    if (!svgRef.current) return null;

    const div = svgRef.current;
    const svg = div.querySelector('svg');
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const scaleX = svgDimensions.width / rect.width;
    const scaleY = svgDimensions.height / rect.height;

    // Get click coordinates relative to SVG
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return {
      x: x * scaleX,
      y: y * scaleY
    };
  };

  const handleVertexSVGClick = (event) => {
    if (currentStage !== 'vertices' || !svgContent) return;

    const coordinates = calculateSVGCoordinates(event);
    if (!coordinates) return;

    const objectName = prompt('Enter object name (optional, press cancel for null):') || null;

    const newVertex = {
      id: `v${vertices.length + 1}`,
      objectName,
      cx: coordinates.x,
      cy: coordinates.y
    };

    setVertices([...vertices, newVertex]);
    toast({ title: "Success", description: "Vertex added successfully" });
  };

  const handleEdgeSVGClick = (event) => {
    if (currentStage !== 'edges' || !svgContent) return;

    const coordinates = calculateSVGCoordinates(event);
    if (!coordinates) return;

    // Find the closest vertex
    const closestVertex = vertices.reduce((closest, vertex) => {
      const distance = Math.sqrt(
        Math.pow(vertex.cx - coordinates.x, 2) + 
        Math.pow(vertex.cy - coordinates.y, 2)
      );
      return (closest === null || distance < closest.distance) 
        ? { vertex, distance } 
        : closest;
    }, null);

    if (closestVertex && closestVertex.distance < 20) {
      // Check if this vertex is already in the selected vertices
      const isAlreadySelected = selectedEdgeVertices.some(
        v => v.id === closestVertex.vertex.id
      );

      if (!isAlreadySelected) {
        const newSelectedVertices = [...selectedEdgeVertices, closestVertex.vertex];
        setSelectedEdgeVertices(newSelectedVertices);
        toast({ title: "Success", description: "Vertex selected for edge" });
      }
    }
  };

  const confirmEdge = () => {
    if (selectedEdgeVertices.length === 2) {
      // Prevent duplicate edges
      const isDuplicateEdge = edges.some(
        edge => 
          (edge.from === selectedEdgeVertices[0].id && 
           edge.to === selectedEdgeVertices[1].id) ||
          (edge.from === selectedEdgeVertices[1].id && 
           edge.to === selectedEdgeVertices[0].id)
      );

      if (!isDuplicateEdge) {
        const newEdge = {
          id: `${selectedEdgeVertices[0].id}_to_${selectedEdgeVertices[1].id}`,
          from: selectedEdgeVertices[0].id,
          to: selectedEdgeVertices[1].id
        };

        setEdges([...edges, newEdge]);
        toast({ title: "Success", description: "Edge created successfully" });
      } else {
        toast({ title: "Warning", description: "This edge already exists" });
      }

      // Reset selection to last vertex to allow continuous edge creation
      setSelectedEdgeVertices([selectedEdgeVertices[1]]);
    }
  };

  const handleReset = () => {
    if (currentStage === 'vertices') {
      setVertices([]);
      setEdges([]);
      toast({ title: "Info", description: "All vertices and edges reset" });
    } else {
      setSelectedEdgeVertices([]);
      toast({ title: "Info", description: "Edge selection reset" });
    }
  };

  const handleCopyJSON = () => {
    const jsonOutput = JSON.stringify(
      { 
        "vertices": vertices,
        "edges": edges 
      }, 
      null, 
      4
    );

    navigator.clipboard.writeText(jsonOutput).then(() => {
      toast({ title: "Success", description: "JSON copied to clipboard" });
    }).catch(err => {
      toast({ title: "Error", description: "Failed to copy JSON" });
      console.error('Failed to copy: ', err);
    });
  };

  const renderSVGWithVertices = () => {
    if (!svgContent) return '';
    
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Set viewBox if not present
    if (!svgElement.hasAttribute('viewBox')) {
      svgElement.setAttribute('viewBox', `0 0 ${svgDimensions.width} ${svgDimensions.height}`);
    }
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', '100%');
    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Add vertex markers and edges
    vertices.forEach(vertex => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', vertex.cx);
      circle.setAttribute('cy', vertex.cy);
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', 'gray');

      if (currentStage === 'edges') {
        const isSelectedEdgeVertex = selectedEdgeVertices.some(v => v.id === vertex.id);
        if (isSelectedEdgeVertex) {
          circle.setAttribute('fill', 'blue');
        }
      }

      svgElement.appendChild(circle);
    });

    if (currentStage === 'edges') {
      edges.forEach(edge => {
        const fromVertex = vertices.find(v => v.id === edge.from);
        const toVertex = vertices.find(v => v.id === edge.to);
        
        if (fromVertex && toVertex) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', fromVertex.cx);
          line.setAttribute('y1', fromVertex.cy);
          line.setAttribute('x2', toVertex.cx);
          line.setAttribute('y2', toVertex.cy);
          line.setAttribute('stroke', 'green');
          line.setAttribute('stroke-width', '2');
          
          svgElement.appendChild(line);
        }
      });
    }

    return svgElement.outerHTML;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <Toaster />
      <div className="bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-800 flex items-center justify-center gap-3">
          <Network className="w-10 h-10 text-purple-600" />
          Indoor Mapping Vertex Mapper
        </h1>
        
        <div className="mb-6 flex items-center space-x-4">
          <Input 
            type="file" 
            accept=".svg" 
            onChange={handleFileUpload} 
            className="flex-grow"
            placeholder="Upload SVG Floor Plan"
          />
          {svgContent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => {
                      setSvgContent('');
                      setVertices([]);
                      setEdges([]);
                      setCurrentStage('vertices');
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear Floor Plan</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {svgContent && (
          <div className="space-y-6">
            <div 
              ref={svgRef}
              dangerouslySetInnerHTML={{ 
                __html: renderSVGWithVertices()
              }}
              onClick={
                currentStage === 'vertices' 
                  ? handleVertexSVGClick 
                  : handleEdgeSVGClick
              }
              className="cursor-pointer border-4 border-gray-300 hover:border-blue-500 transition-all rounded-lg overflow-hidden"
            />
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
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
                        onClick={confirmEdge}
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
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    Reset {currentStage === 'vertices' ? 'All' : 'Selection'}
                  </Button>
                </div>

                {vertices.length > 0 && edges.length > 0 && (
                  <Button 
                    onClick={handleCopyJSON}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="mr-2 h-5 w-5" />
                    Copy Full JSON
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl mb-2 font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Vertices ({vertices.length})
                  </h2>
                  <pre className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto border">
                    {JSON.stringify(vertices, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h2 className="text-xl mb-2 font-semibold flex items-center gap-2">
                    <GitGraph className="h-5 w-5 text-green-600" />
                    Edges ({edges.length})
                  </h2>
                  <pre className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto border">
                    {JSON.stringify(edges, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {!svgContent && (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              Please upload an SVG floor plan to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SVGVertexMapper;