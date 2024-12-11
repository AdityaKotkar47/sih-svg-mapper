import React from 'react';

export const SVGDisplay = ({ 
  svgContent,
  svgDimensions,
  vertices,
  edges,
  currentStage,
  selectedEdgeVertices,
  onVertexClick,
  onEdgeClick,
  svgRef
}) => {
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

    return svgElement.outerHTML;
  };

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
      <div 
        ref={svgRef}
        dangerouslySetInnerHTML={{ __html: renderSVGWithVertices() }}
        onClick={currentStage === 'vertices' ? onVertexClick : onEdgeClick}
        className="cursor-pointer border-4 border-gray-300 hover:border-blue-500 transition-all rounded-lg inline-block"
        style={{
          minWidth: svgDimensions.width ? `${svgDimensions.width}px` : 'auto',
          minHeight: svgDimensions.height ? `${svgDimensions.height}px` : 'auto'
        }}
      />
    </div>
  );
};