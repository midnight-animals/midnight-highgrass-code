import React, { useEffect, useState } from 'react';

import Graph from 'graphology';
import { Attributes } from 'graphology-types';

import {
  useSigma,
  useRegisterEvents,
  useLoadGraph,
  useSetSettings,
} from '@react-sigma/core';

export interface GraphDefaultProps {
  /**
   * Number of node to generates
   */
  order: number;
  /**
   * Probability that two nodes are linked
   */
  probability: number;
}
export const GraphDefault: React.FC<GraphDefaultProps> = ({
  order,
  probability,
}) => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const loadGraph = useLoadGraph();
  const setSettings = useSetSettings();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    // Create the graph
    const graph = new Graph();
    for (let i = 0; i < order; i++) {
      graph.addNode(i, {
        label: 'Node ' + i,
        size: 15,
        color: 'orange',
        x: 0,
        y: 0,
      });
    }
    for (let i = 0; i < order; i++) {
      for (let j = i + 1; j < order; j++) {
        if (Math.random() < probability) graph.addDirectedEdge(i, j);
        if (Math.random() < probability) graph.addDirectedEdge(j, i);
      }
    }

    loadGraph(graph);

    // Register the events
    registerEvents({
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [loadGraph, registerEvents, order, probability]);

  useEffect(() => {
    setSettings({
      nodeReducer: (node, data) => {
        const graph = sigma.getGraph();
        const newData: Attributes = {
          ...data,
          highlighted: data.highlighted || false,
        };

        if (hoveredNode) {
          if (
            node === hoveredNode ||
            graph.neighbors(hoveredNode).includes(node)
          ) {
            newData.highlighted = true;
          } else {
            newData.color = '#E2E2E2';
            newData.highlighted = false;
          }
        }
        return newData;
      },
      edgeReducer: (edge, data) => {
        const graph = sigma.getGraph();
        const newData = { ...data, hidden: false };

        if (hoveredNode && !graph.extremities(edge).includes(hoveredNode)) {
          newData.hidden = true;
        }
        return newData;
      },
    });
  }, [hoveredNode, setSettings, sigma]);

  return null;
};
