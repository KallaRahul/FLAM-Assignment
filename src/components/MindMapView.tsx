import React, { useState } from 'react';
import type { MindMapNode } from '../types/result';
import { GitFork, CornerDownRight, Info } from 'lucide-react';

interface MindMapViewProps {
  nodes: MindMapNode[];
}

export const MindMapView: React.FC<MindMapViewProps> = ({ nodes }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id || null);

  if (!nodes || nodes.length === 0) {
    return <div className="empty-summary">No mind map tree nodes generated.</div>;
  }

  // Find root nodes (parentId is null/undefined or not matching any existing id)
  const rootNodes = nodes.filter((n) => !n.parentId || !nodes.some((other) => other.id === n.parentId));
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const getChildren = (parentId: string) => nodes.filter((n) => n.parentId === parentId);

  const renderTreeNode = (node: MindMapNode, depth = 0) => {
    const isSelected = selectedNodeId === node.id;
    const children = getChildren(node.id);

    return (
      <div key={node.id} className="tree-node-branch" style={{ marginLeft: `${depth * 20}px` }}>
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`tree-node-card ${isSelected ? 'selected' : ''}`}
        >
          <div className="node-icon-wrap">
            {depth === 0 ? <GitFork className="w-4 h-4 text-indigo-400" /> : <CornerDownRight className="w-3.5 h-3.5 text-cyan-400" />}
          </div>
          <div className="node-content font-sans">
            <span className="node-label">{node.label}</span>
            {node.category && <span className="node-category-tag font-mono">{node.category}</span>}
          </div>
        </div>

        {children.length > 0 && (
          <div className="children-container">
            {children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mindmap-module font-sans">
      <div className="mindmap-header">
        <GitFork className="w-5 h-5 text-indigo-400" />
        <h3 className="mindmap-title">Interactive Knowledge Tree & Mind Map</h3>
      </div>

      <div className="mindmap-split-view">
        {/* Left Side: Tree Hierarchy */}
        <div className="tree-hierarchy-panel">
          {rootNodes.map((root) => renderTreeNode(root, 0))}
        </div>

        {/* Right Side: Selected Node Inspector */}
        {selectedNode && (
          <div className="node-inspector-panel">
            <div className="inspector-header">
              <Info className="w-4 h-4 text-cyan-400" />
              <span className="inspector-title font-mono">NODE INSPECTOR</span>
            </div>

            <div className="inspector-body">
              <h4 className="inspector-node-label">{selectedNode.label}</h4>
              {selectedNode.category && (
                <span className="inspector-node-tag">{selectedNode.category}</span>
              )}

              <p className="inspector-description">
                {selectedNode.description || 'No detailed node breakdown specified for this node.'}
              </p>

              <div className="inspector-meta-row font-mono">
                <div>Node ID: <code>{selectedNode.id}</code></div>
                <div>Parent ID: <code>{selectedNode.parentId || 'None (Root Node)'}</code></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
