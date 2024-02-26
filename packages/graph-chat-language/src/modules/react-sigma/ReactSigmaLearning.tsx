import { SigmaContainer, useLoadGraph } from '@react-sigma/core';
import { FC, useEffect } from 'react';
import Graph, { MultiDirectedGraph } from 'graphology';
import '@react-sigma/core/lib/react-sigma.min.css';

const MyGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Create the graph
    const graph = new MultiDirectedGraph();
    graph.addNode('A', { x: 0, y: 0, label: 'Node A', size: 10 });
    graph.addNode('B', { x: 1, y: 1, label: 'Node B', size: 10 });
    graph.addEdgeWithKey('rel1', 'A', 'B', { label: 'REL_1' });
    graph.addEdgeWithKey('rel2', 'A', 'B', { label: 'REL_2' });

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

export const MultiDirectedGraphView: FC = () => {
  return (
    <SigmaContainer graph={MultiDirectedGraph}>
      <MyGraph />
    </SigmaContainer>
  );
};

export const LoadGraph = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();
    graph.addNode('first', {
      x: 0,
      y: 0,
      size: 15,
      label: 'My first node',
      color: '#FA4F40',
    });
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

export const DisplayGraph = () => {
  return (
    <SigmaContainer style={{ height: '500px', width: '500px' }}>
      <LoadGraph />
    </SigmaContainer>
  );
};
