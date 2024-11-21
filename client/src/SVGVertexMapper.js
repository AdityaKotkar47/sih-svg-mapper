import React, { useState } from 'react';
import { Button } from "./components/ui/button/button";
import { Input } from "./components/ui/input/input";

function SVGVertexMapper() {
  const [svgContent, setSvgContent] = useState('');
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);
  const [copiedText, setCopiedText] = useState('');
  const [currentStage, setCurrentStage] = useState('vertices');
  const [selectedEdgeVertices, setSelectedEdgeVertices] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setSvgContent(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleVertexSVGClick = (event) => {
    if (currentStage !== 'vertices') return;

    const svg = event.target.closest('svg');
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    const objectName = prompt('Enter object name (optional, press cancel for null):') || null;

    const newVertex = {
      id: `v${vertices.length + 1}`,
      objectName,
      cx: svgPoint.x,
      cy: svgPoint.y
    };

    setVertices([...vertices, newVertex]);
  };

  const handleEdgeSVGClick = (event) => {
    if (currentStage !== 'edges') return;

    const svg = event.target.closest('svg');
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    // Find the closest vertex
    const closestVertex = vertices.reduce((closest, vertex) => {
      const distance = Math.sqrt(
        Math.pow(vertex.cx - svgPoint.x, 2) + 
        Math.pow(vertex.cy - svgPoint.y, 2)
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
      }

      // Reset selection to last vertex to allow continuous edge creation
      setSelectedEdgeVertices([selectedEdgeVertices[1]]);
    }
  };

  const handleReset = () => {
    if (currentStage === 'vertices') {
      setVertices([]);
      setEdges([]);
    } else {
      setSelectedEdgeVertices([]);
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
      setCopiedText('Copied!');
      setTimeout(() => setCopiedText(''), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const renderSVGWithVertices = () => {
    // Create a deep copy of the SVG content
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Add vertex markers
    vertices.forEach(vertex => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', vertex.cx);
      circle.setAttribute('cy', vertex.cy);
      circle.setAttribute('r', '5');
      
      // Vertices in grey in both stages
      circle.setAttribute('fill', 'gray');

      // Highlight selected vertices in edges stage
      if (currentStage === 'edges') {
        const isSelectedEdgeVertex = selectedEdgeVertices.some(v => v.id === vertex.id);
        if (isSelectedEdgeVertex) {
          circle.setAttribute('fill', 'blue');
        }
      }

      svgElement.appendChild(circle);
    });

    // Add edges
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

    // Serialize the modified SVG back to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Indoor Mapping Vertex Mapper
      </h1>
      
      <div className="mb-4">
        <Input 
          type="file" 
          accept=".svg" 
          onChange={handleFileUpload} 
          className="mb-2 w-full"
          placeholder="Upload SVG Floor Plan"
        />
      </div>

      {svgContent && (
        <div className="space-y-4">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: renderSVGWithVertices()
            }}
            onClick={
              currentStage === 'vertices' 
                ? handleVertexSVGClick 
                : handleEdgeSVGClick
            }
            className="cursor-pointer border-4 border-gray-300 hover:border-blue-500 transition-all"
          />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                {currentStage === 'vertices' ? (
                  <Button 
                    onClick={() => setCurrentStage('edges')}
                    disabled={vertices.length < 2}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Proceed to Edges
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={confirmEdge}
                      disabled={selectedEdgeVertices.length !== 2}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
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
                  className="bg-red-500 hover:bg-red-600"
                >
                  Reset {currentStage === 'vertices' ? 'All' : 'Selection'}
                </Button>
              </div>

              {vertices.length > 0 && edges.length > 0 && (
                <Button 
                  onClick={handleCopyJSON}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Copy Full JSON
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-xl mb-2 font-semibold">
                  Vertices ({vertices.length})
                </h2>
                <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto">
                  {JSON.stringify(vertices, null, 2)}
                </pre>
              </div>
              
              <div>
                <h2 className="text-xl mb-2 font-semibold">
                  Edges ({edges.length})
                </h2>
                <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto">
                  {JSON.stringify(edges, null, 2)}
                </pre>
              </div>
            </div>

            {copiedText && (
              <p className="text-green-600 text-center mt-2">
                {copiedText}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SVGVertexMapper;