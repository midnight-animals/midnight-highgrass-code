import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const width = 600;
const height = 400;
const numNodes = 100;
const FORCE_STRENGTH_INITIAL = 1;
const FORCE_STRENGTH_BOUNDARY = 10;
const FORCE_STRENGTH_STEP = 0.5;
const FORCE_COLLIDE_INITIAL = 0;
const FORCE_COLLIDE_BOUNDARY = 50;
const FORCE_COLLIDE_STEP = 1;
const NODE_RADIUS_INITIAL = 0;
const NODE_RADIUS_BOUNDARY = 20;
const NODE_RADIUS_STEP = 1;

const ticksPerRender = 3;
// const ALPHA_THRESHOLD = 0.0000000001;
// const ALPHA_THRESHOLD = 0.000001;
const ALPHA_THRESHOLD = 0.01;

interface D3Node extends SimulationNodeDatum {
  radius: number;
  x: number;
  y: number;
}

let nodes = d3.range(numNodes).map(function () {
  return { radius: Math.random() * 25 };
}) as SimulationNodeDatum[];

function resetNodes() {
  nodes = d3.range(numNodes).map(function () {
    return { radius: Math.random() * 25 };
  }) as SimulationNodeDatum[];
}

export const D3ForceSimulation: React.FC = (): JSX.Element => {
  const ref = useRef<SVGSVGElement>(null);
  const [isForceCollideActive, setIsForceCollideActive] = useState(false);
  const [centerForce, setCenterForce] = useState(width / 2); // New state for center force
  const [forceStrength, setForceStrength] = useState(FORCE_STRENGTH_INITIAL);
  const [forceCollide, setForceCollide] = useState(FORCE_COLLIDE_INITIAL);
  const [nodeRadius, setNodeRadius] = useState(NODE_RADIUS_INITIAL);

  const ticked = () => {
    // console.log('--');
    const svgElement = d3.select(ref.current);
    svgElement
      .selectAll('circle')
      .style('color', 'cadetblue')
      .data(nodes)
      .join('circle')
      // .attr('r', (d) => 5)
      .attr('r', (d) => (d as D3Node).radius + nodeRadius)
      .attr('cx', (d) => (d as D3Node).x)
      .attr('cy', (d) => (d as D3Node).y);
  };

  const simulation = useMemo(() => {
    return d3
      .forceSimulation(nodes)
      .force('center', d3.forceCenter(centerForce, height / 2)) // Use centerForce state
      .force(
        'collision',
        d3.forceCollide().radius(function (d) {
          // return 5;
          return (d as D3Node).radius + nodeRadius;
        }),
      );
  }, [
    nodes,
    isForceCollideActive,
    centerForce,
    forceStrength,
    forceCollide,
    nodeRadius,
  ]);
  const simulationRef = useRef(simulation);

  useEffect(() => {
    // Stop the previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Start the new simulation
    simulationRef.current = simulation;

    // Cleanup function to stop the simulation when the component unmounts
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [simulation]); // Run this effect whenever the simulation changes

  function startTicking() {
    requestAnimationFrame(function render() {
      for (let i = 0; i < ticksPerRender; i++) {
        simulationRef.current.tick();
      }

      ticked();

      if (simulationRef.current.alpha() > ALPHA_THRESHOLD) {
        requestAnimationFrame(render);
      }
    });
  }

  const handleForceChange = useCallback(() => {
    resetNodes();
    simulationRef.current.nodes(nodes);
    if (isForceCollideActive) {
      simulationRef.current.force('charge', null);
      simulationRef.current.force('collision', null);
    } else {
      simulationRef.current.force(
        'charge',
        d3.forceManyBody().strength(forceStrength),
      );
      simulationRef.current
        .force('center', d3.forceCenter(centerForce, height / 2)) // Use centerForce state
        .force(
          'collision',
          d3.forceCollide().radius(function (d) {
            // return 5;
            return (d as D3Node).radius + forceCollide;
          }),
        );
    }
    startTicking();
  }, [
    centerForce,
    forceCollide,
    forceStrength,
    isForceCollideActive,
    nodeRadius,
  ]);

  useEffect(() => {
    handleForceChange();
  }, [
    isForceCollideActive,
    centerForce,
    forceStrength,
    forceCollide,
    handleForceChange,
  ]);

  return (
    <>
      <section>
        <svg
          width={width}
          height={height}
          style={{ border: '1px solid red' }}
          ref={ref}
        ></svg>
      </section>
      <section>
        isForceCollideActive
        <input
          type="checkbox"
          checked={isForceCollideActive}
          onChange={() => {
            setIsForceCollideActive(!isForceCollideActive);
          }}
        />
        <div>
          Force center
          <input
            type="range"
            min="0"
            max={width}
            value={centerForce}
            onChange={(event) => setCenterForce(Number(event.target.value))}
          />
        </div>
        <div>
          Force Strength
          <input
            type="number"
            step={FORCE_STRENGTH_STEP}
            min={-FORCE_STRENGTH_BOUNDARY}
            max={FORCE_STRENGTH_BOUNDARY}
            value={forceStrength}
            onChange={(event) => setForceStrength(Number(event.target.value))}
          />
        </div>
        <div>
          Force Collide
          <input
            type="number"
            step={FORCE_COLLIDE_STEP}
            min={-FORCE_COLLIDE_BOUNDARY}
            max={FORCE_COLLIDE_BOUNDARY}
            value={forceCollide}
            onChange={(event) => setForceCollide(Number(event.target.value))}
          />
        </div>
        <div>
          Radius
          <input
            type="number"
            step={NODE_RADIUS_STEP}
            min={-NODE_RADIUS_BOUNDARY}
            max={NODE_RADIUS_BOUNDARY}
            value={nodeRadius}
            onChange={(event) => setNodeRadius(Number(event.target.value))}
          />
        </div>
      </section>
    </>
  );
};
