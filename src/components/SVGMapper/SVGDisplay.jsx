import React, { useEffect } from 'react';

export const SVGDisplay = ({ 
  svgContent,
  svgDimensions,
  vertices,
  edges,
  selectedVertices = [],
  selectedEdges = [],
  handleVertexClick,
  handleEdgeClick,
  svgRef
}) => {
  useEffect(() => {
    // Add event listeners after the SVG is rendered
    if (svgRef.current) {
      const svg = svgRef.current;
      
      // Handle vertex clicks
      const vertexElements = svg.querySelectorAll('[data-vertex-id]');
      vertexElements.forEach(vertex => {
        vertex.onclick = (e) => {
          e.stopPropagation();
          const vertexId = vertex.getAttribute('data-vertex-id');
          handleVertexClick(vertexId);
        };
      });

      // Handle edge clicks
      const edgeElements = svg.querySelectorAll('[data-edge-id]');
      edgeElements.forEach(edge => {
        edge.onclick = (e) => {
          e.stopPropagation();
          const edgeId = edge.getAttribute('data-edge-id');
          handleEdgeClick(edgeId);
        };
      });
    }
  }, [svgContent, vertices, edges, handleVertexClick, handleEdgeClick]);

  const renderSVGWithVertices = () => {
    if (!svgContent) return '';
    
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    if (svgDimensions.width && svgDimensions.height) {
      svgElement.setAttribute('width', svgDimensions.width);
      svgElement.setAttribute('height', svgDimensions.height);
      
      if (!svgElement.hasAttribute('viewBox')) {
        svgElement.setAttribute('viewBox', `0 0 ${svgDimensions.width} ${svgDimensions.height}`);
      }
    }

    svgElement.removeAttribute('preserveAspectRatio');

    // Add edges
    edges.forEach(edge => {
      const sourceVertex = vertices.find(v => v.id === edge.source);
      const targetVertex = vertices.find(v => v.id === edge.target);
      
      if (sourceVertex && targetVertex) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceVertex.cx);
        line.setAttribute('y1', sourceVertex.cy);
        line.setAttribute('x2', targetVertex.cx);
        line.setAttribute('y2', targetVertex.cy);
        line.setAttribute('stroke', selectedEdges.includes(edge.id) ? 'red' : 'green');
        line.setAttribute('stroke-width', selectedEdges.includes(edge.id) ? '3' : '2');
        line.setAttribute('cursor', 'pointer');
        line.setAttribute('data-edge-id', edge.id);
        svgElement.appendChild(line);
      }
    });

    // Add vertices
    vertices.forEach(vertex => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', vertex.cx);
      circle.setAttribute('cy', vertex.cy);
      circle.setAttribute('r', selectedVertices.includes(vertex.id) ? '6' : '5');
      circle.setAttribute('fill', selectedVertices.includes(vertex.id) ? 'red' : 'blue');
      circle.setAttribute('cursor', 'pointer');
      circle.setAttribute('data-vertex-id', vertex.id);
      group.appendChild(circle);

      // Add vertex label if it has an object name
      if (vertex.objectName) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', parseFloat(vertex.cx) + 10);
        text.setAttribute('y', parseFloat(vertex.cy) - 10);
        text.setAttribute('fill', selectedVertices.includes(vertex.id) ? 'red' : 'black');
        text.textContent = vertex.objectName;
        group.appendChild(text);
      }

      svgElement.appendChild(group);
    });

    return svgElement.outerHTML;
  };

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
      <div 
        ref={svgRef}
        dangerouslySetInnerHTML={{ __html: renderSVGWithVertices() }}
        className="border-4 border-gray-300 hover:border-blue-500 transition-all rounded-lg inline-block"
        style={{
          minWidth: svgDimensions.width ? `${svgDimensions.width}px` : 'auto',
          minHeight: svgDimensions.height ? `${svgDimensions.height}px` : 'auto'
        }}
      />
    </div>
  );
};