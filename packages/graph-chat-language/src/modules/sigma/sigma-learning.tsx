/**
 * This example showcases sigma's reducers, which aim to facilitate dynamically
 * changing the appearance of nodes and edges, without actually changing the
 * main graphology data.
 */

import Sigma from 'sigma';
import { Coordinates, EdgeDisplayData, NodeDisplayData } from 'sigma/types';
import Graph from 'graphology';
import data from './data.json';
import { useEffect, useRef } from 'react';
import './sigma-learning.scss';

interface State {
  hoveredNode?: string;
  searchQuery: string;

  // State derived from query:
  selectedNode?: string;
  suggestions?: Set<string>;

  // State derived from hovered node:
  hoveredNeighbors?: Set<string>;
}

const state: State = { searchQuery: '' };

export const SigmaLearning: React.FC = (): JSX.Element => {
  const container = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchSuggestions = useRef<HTMLDataListElement>(null);

  useEffect(() => {
    // Instantiate sigma:
    const graph = new Graph();
    graph.import(data);

    if (!container.current) return;
    if (!searchInput.current) return;
    if (!searchSuggestions.current) return;

    const renderer = new Sigma(graph, container.current);

    // Type and declare internal state:

    // Feed the datalist autocomplete values:
    searchSuggestions.current.innerHTML = graph
      .nodes()
      .map(
        (node) =>
          `<option value="${graph.getNodeAttribute(node, 'label')}"></option>`,
      )
      .join('\n');

    // Actions:
    function setSearchQuery(query: string) {
      state.searchQuery = query;

      if (searchInput.current?.value !== query)
        searchInput.current.value = query;

      if (query) {
        const lcQuery = query.toLowerCase();
        const suggestions = graph
          .nodes()
          .map((n) => ({
            id: n,
            label: graph.getNodeAttribute(n, 'label') as string,
          }))
          .filter(({ label }) => label.toLowerCase().includes(lcQuery));

        // If we have a single perfect match, them we remove the suggestions, and
        // we consider the user has selected a node through the datalist
        // autocomplete:
        if (suggestions.length === 1 && suggestions[0].label === query) {
          state.selectedNode = suggestions[0].id;
          state.suggestions = undefined;

          // Move the camera to center it on the selected node:
          const nodePosition = renderer.getNodeDisplayData(
            state.selectedNode,
          ) as Coordinates;
          renderer.getCamera().animate(nodePosition, {
            duration: 500,
          });
        }
        // Else, we display the suggestions list:
        else {
          state.selectedNode = undefined;
          state.suggestions = new Set(suggestions.map(({ id }) => id));
        }
      }
      // If the query is empty, then we reset the selectedNode / suggestions state:
      else {
        state.selectedNode = undefined;
        state.suggestions = undefined;
      }

      // Refresh rendering
      // You can directly call `renderer.refresh()`, but if you need performances
      // you can provide some options to the refresh method.
      // In this case, we don't touch the graph data so we can skip its reindexation
      /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'darkblue'}`);
      renderer.refresh({
        skipIndexation: true,
      });
    }
    function setHoveredNode(node?: string) {
      if (node) {
        state.hoveredNode = node;
        state.hoveredNeighbors = new Set(graph.neighbors(node));
      }

      // Compute the partial that we need to re-render to optimize the refresh
      const nodes = graph.filterNodes(
        (n) => n !== state.hoveredNode && !state.hoveredNeighbors?.has(n),
      );
      const nodesIndex = new Set(nodes);
      const edges = graph.filterEdges((e) =>
        graph.extremities(e).some((n) => nodesIndex.has(n)),
      );

      if (!node) {
        state.hoveredNode = undefined;
        state.hoveredNeighbors = undefined;
      }

      // Refresh rendering
      renderer.refresh({
        partialGraph: {
          nodes,
          edges,
        },
        // We don't touch the graph data so we can skip its reindexation
        skipIndexation: true,
      });
    }

    // Bind search input interactions:
    searchInput.current.addEventListener('input', () => {
      setSearchQuery(searchInput.current.value || '');
    });
    searchInput.current.addEventListener('blur', () => {
      setSearchQuery('');
    });

    // Bind graph interactions:
    renderer.on('enterNode', ({ node }) => {
      setHoveredNode(node);
    });
    renderer.on('leaveNode', () => {
      setHoveredNode(undefined);
    });

    renderer.on('wheelNode', () => {
      /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'darkblue'}`);
      renderer.refresh();
    });
    renderer.on('wheelStage', () => {
      /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'darkblue'}`);
      renderer.refresh();
    });
    renderer.on('wheelEdge', () => {
      /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'darkblue'}`);
      renderer.refresh();
    });

    // Render nodes accordingly to the internal state:
    // 1. If a node is selected, it is highlighted
    // 2. If there is query, all non-matching nodes are greyed
    // 3. If there is a hovered node, all non-neighbor nodes are greyed
    renderer.setSetting('nodeReducer', (node, data) => {
      const res: Partial<NodeDisplayData> = { ...data };

      if (
        state.hoveredNeighbors &&
        !state.hoveredNeighbors.has(node) &&
        state.hoveredNode !== node
      ) {
        res.label = '';
        res.color = '#f6f6f6';
      }

      if (state.selectedNode === node) {
        res.highlighted = true;
      } else if (state.suggestions) {
        if (state.suggestions.has(node)) {
          res.forceLabel = true;
        } else {
          res.label = '';
          res.color = '#f6f6f6';
        }
      }

      return res;
    });

    // Render edges accordingly to the internal state:
    // 1. If a node is hovered, the edge is hidden if it is not connected to the
    //    node
    // 2. If there is a query, the edge is only visible if it connects two
    //    suggestions
    renderer.setSetting('edgeReducer', (edge, data) => {
      const res: Partial<EdgeDisplayData> = { ...data };

      if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
        res.hidden = true;
      }

      if (
        state.suggestions &&
        (!state.suggestions.has(graph.source(edge)) ||
          !state.suggestions.has(graph.target(edge)))
      ) {
        res.hidden = true;
      }

      return res;
    });
  }, []);

  return (
    <>
      <div ref={container} id="sigma-container"></div>
      <input ref={searchInput} id="search-input" />
      <datalist ref={searchSuggestions} id="suggestions"></datalist>
    </>
  );

  // return (
  //   <>
  //     <div ref={container} className="sigma-container"></div>
  //     <div ref={searchInput} className="search-input"></div>
  //     <div ref={searchSuggestions} className="suggestions"></div>
  //   </>
  // );
};
