import React, { useState, useRef } from 'react';
import { useToast } from "../../hooks/use-toast";
import { SVGUploader } from './SVGUploader';
import { SVGDisplay } from './SVGDisplay';
import { ActionButtons } from './ActionButtons';
import { DataDisplay } from './DataDisplay';
import { EmptyState } from './EmptyState';
import { Network } from "lucide-react";

function SVGVertexMapper() {
  const { toast } = useToast();
  const [svgContent, setSvgContent] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);
  const [currentStage, setCurrentStage] = useState('vertices');
  const [selectedEdgeVertices, setSelectedEdgeVertices] = useState([]);
  const [isCopying, setIsCopying] = useState(false);
  const svgRef = useRef(null);

  const calculateSVGCoordinates = (event) => {
    if (!svgRef.current) return null;

    const svg = svgRef.current.querySelector('svg');
    if (!svg) return null;

    const ctm = svg.getScreenCTM();
    if (!ctm) return null;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    return point.matrixTransform(ctm.inverse());
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
    toast({
      title: "Vertex Added",
      description: `Added vertex at (${coordinates.x.toFixed(2)}, ${coordinates.y.toFixed(2)})`,
    });
  };

  const handleEdgeSVGClick = (event) => {
    if (currentStage !== 'edges' || !svgContent) return;

    const coordinates = calculateSVGCoordinates(event);
    if (!coordinates) return;

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
      const isAlreadySelected = selectedEdgeVertices.some(
        v => v.id === closestVertex.vertex.id
      );

      if (!isAlreadySelected) {
        const newSelectedVertices = [...selectedEdgeVertices, closestVertex.vertex];
        setSelectedEdgeVertices(newSelectedVertices);
        toast({
          title: "Vertex Selected",
          description: `Selected vertex ${closestVertex.vertex.id}${
            closestVertex.vertex.objectName ? ` (${closestVertex.vertex.objectName})` : ''
          }`,
        });
      }
    }
  };

  const confirmEdge = () => {
    if (selectedEdgeVertices.length === 2) {
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
        toast({
          title: "Edge Created",
          description: `Created edge between ${selectedEdgeVertices[0].id} and ${selectedEdgeVertices[1].id}`,
        });
      } else {
        toast({
          title: "Warning",
          description: "This edge already exists",
          variant: "destructive"
        });
      }

      setSelectedEdgeVertices([selectedEdgeVertices[1]]);
    }
  };

  const handleReset = () => {
    if (currentStage === 'vertices') {
      setVertices([]);
      setEdges([]);
      toast({
        title: "Reset Complete",
        description: "All vertices and edges have been cleared"
      });
    } else {
      setSelectedEdgeVertices([]);
      toast({
        title: "Selection Reset",
        description: "Edge selection has been cleared"
      });
    }
  };

  const handleCopyJSON = async () => {
    setIsCopying(true);
    const jsonOutput = JSON.stringify(
      { 
        vertices: vertices,
        edges: edges 
      }, 
      null, 
      4
    );

    try {
      await navigator.clipboard.writeText(jsonOutput);
      toast({
        title: "Copied!",
        description: "JSON data has been copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy JSON data",
        variant: "destructive"
      });
      console.error('Failed to copy: ', err);
    } finally {
      setIsCopying(false);
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgString = e.target.result;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgString;
      const svgElement = tempDiv.querySelector('svg');
      
      let width, height;
      
      if (svgElement.hasAttribute('viewBox')) {
        const viewBox = svgElement.viewBox.baseVal;
        width = viewBox.width;
        height = viewBox.height;
      } else {
        width = parseFloat(svgElement.getAttribute('width')) || 0;
        height = parseFloat(svgElement.getAttribute('height')) || 0;
      }

      setSvgDimensions({ width, height });
      setSvgContent(svgString);
    };
    reader.readAsText(file);
  };

  const clearSVG = () => {
    setSvgContent('');
    setVertices([]);
    setEdges([]);
    setCurrentStage('vertices');
    setSelectedEdgeVertices([]);
  };

  return (
    <div className="p-6 max-w-full mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-800 flex items-center justify-center gap-3">
        <Network className="w-10 h-10 text-purple-600" />
        Indoor Mapping Vertex Mapper
      </h1>
      <div className="bg-white shadow-xl rounded-lg p-8">
        <SVGUploader 
          onFileUpload={handleFileUpload}
          onClear={clearSVG}
          hasSVG={!!svgContent}
        />

        {svgContent ? (
          <>
            <SVGDisplay
              svgContent={svgContent}
              svgDimensions={svgDimensions}
              vertices={vertices}
              edges={edges}
              currentStage={currentStage}
              selectedEdgeVertices={selectedEdgeVertices}
              onVertexClick={handleVertexSVGClick}
              onEdgeClick={handleEdgeSVGClick}
              svgRef={svgRef}
            />

            <ActionButtons
              currentStage={currentStage}
              setCurrentStage={setCurrentStage}
              vertices={vertices}
              selectedEdgeVertices={selectedEdgeVertices}
              onConfirmEdge={confirmEdge}
              onReset={handleReset}
              onCopyJSON={handleCopyJSON}
              isCopying={isCopying}
              hasEdges={edges.length > 0}
            />

            <DataDisplay 
              vertices={vertices}
              edges={edges}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

export default SVGVertexMapper;