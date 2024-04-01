import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './ForceSimulation.scss';

const width = 600;
const height = 400;
const numNodes = 8;
const IS_FORCE_ACTIVE = true;
const IS_X_COLLIDE = false;
const IS_Y_COLLIDE = false;
const FORCE_STRENGTH_INITIAL = 10;
const FORCE_STRENGTH_BOUNDARY = 100;
const FORCE_STRENGTH_STEP = 10;
const FORCE_COLLIDE_INITIAL = 0;
const FORCE_COLLIDE_BOUNDARY = 50;
const FORCE_COLLIDE_STEP = 10;
const LINK_DISTANCE_INITIAL = 30;
const LINK_DISTANCE_BOUNDARY = 50;
const LINK_DISTANCE_STEP = 10;
const NODE_RADIUS_INITIAL = 0;
const NODE_RADIUS_BOUNDARY = 20;
const NODE_RADIUS_STEP = 1;
const NODE_RADIUS_MAX = 10;

const xCenter = [100, 300, 500];
const ticksPerRender = 3;
// const ALPHA_THRESHOLD = 0.0000000001;
const ALPHA_THRESHOLD = 0.000001;
// const ALPHA_THRESHOLD = 0.01;
// const ALPHA_THRESHOLD = 0.99;
const xScale = d3.scaleLinear().domain([0, 1]).range([0, 600]);

const links = [
  { source: 0, target: 1 },
  { source: 0, target: 2 },
  { source: 0, target: 3 },
  { source: 1, target: 6 },
  { source: 3, target: 4 },
  { source: 3, target: 7 },
  { source: 4, target: 5 },
  { source: 4, target: 7 },
];

interface D3Node extends SimulationNodeDatum {
  radius: number;
  category: number;
  value: number;
  name: string;
  x: number;
  y: number;
}

const nodes = d3.range(numNodes).map(function (index) {
  return {
    name: index.toString(),
    radius: Math.random() * NODE_RADIUS_MAX,
    value: Math.random(),
    category: Math.floor(Math.random() * 3),
  };
}) as SimulationNodeDatum[];
/* prettier-ignore */ console.log('>>>> _ >>>> ~ nodes:', nodes);

function resetNodes() {
  nodes.forEach((node: D3Node) => {
    node.radius = Math.random() * NODE_RADIUS_MAX;
    node.category = Math.floor(Math.random() * 3);
  });
  // nodes = d3.range(numNodes).map(function () {
  //   return {
  //     radius: Math.random() * NODE_RADIUS_MAX,
  //     category: Math.floor(Math.random() * 3),
  //   };
  // }) as SimulationNodeDatum[];
}

export const D3ForceSimulation: React.FC = (): JSX.Element => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isForceCollideActive, setIsForceCollideActive] =
    useState(IS_FORCE_ACTIVE);
  const [isXCollide, setIsXCollide] = useState(IS_X_COLLIDE);
  const [isYCollide, setIsYCollide] = useState(IS_Y_COLLIDE);
  const [centerForce, setCenterForce] = useState(width / 2); // New state for center force
  const [forceStrength, setForceStrength] = useState(FORCE_STRENGTH_INITIAL);
  const [forceCollide, setForceCollide] = useState(FORCE_COLLIDE_INITIAL);
  const [linkDistance, setLinkDistance] = useState(LINK_DISTANCE_INITIAL);
  const [nodeRadius, setNodeRadius] = useState(NODE_RADIUS_INITIAL);

  const simulation = useMemo(() => {
    return (
      d3
        .forceSimulation(nodes)
        .force('center', d3.forceCenter(centerForce, height / 2)) // Use centerForce state
        .force(
          'collision',
          d3.forceCollide().radius(function (d) {
            // return 5;
            return (d as D3Node).radius + nodeRadius;
          }),
        )
        .force(
          'x',
          d3.forceX().x(function (d) {
            return xCenter[(d as D3Node).category];
          }),
        )
        // .force(
        //   'x',
        //   d3.forceX().x(function (d) {
        //     return xScale((d as D3Node).value);
        //   }),
        // )
        // .force(
        //   'y',
        //   d3.forceY().y(function (d) {
        //     return 0;
        //   }),
        // )
        .force('link', d3.forceLink().links(links).distance(linkDistance))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    nodes,
    isForceCollideActive,
    isXCollide,
    isYCollide,
    centerForce,
    forceStrength,
    forceCollide,
    linkDistance,
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

      updateCircles();
      updateLinks();

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
      if (isXCollide) {
        simulationRef.current.force('x', null);
      }
      if (isYCollide) {
        simulationRef.current.force('y', null);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    centerForce,
    forceCollide,
    forceStrength,
    isForceCollideActive,
    isXCollide,
    isYCollide,
    linkDistance,
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

  const updateCircles = () => {
    // console.log('--');
    const svgElement = d3.select(svgRef.current);
    svgElement
      // .style('color', 'cadetblue')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(function (d) {
        return (d as D3Node).name;
      })
      // .attr('r', (d) => 5)
      .attr('r', (d) => (d as D3Node).radius + nodeRadius)
      .attr('x', (d) => (d as D3Node).x)
      .attr('y', (d) => (d as D3Node).y);
    // .attr('cx', (d) => (d as D3Node).x)
    // .attr('cy', (d) => (d as D3Node).y);
  };

  function updateLinks() {
    const svgElement = d3.select(svgRef.current);
    svgElement
      .selectAll('line')
      .style('stroke', '#ccc')
      .data(links)
      .join('line')
      .attr('x1', function (d) {
        return d.source.x;
      })
      .attr('y1', function (d) {
        return d.source.y;
      })
      .attr('x2', function (d) {
        return d.target.x;
      })
      .attr('y2', function (d) {
        return d.target.y;
      });
  }

  return (
    <>
      <section>
        <svg
          width={width}
          height={height}
          style={{ border: '1px solid red' }}
          ref={svgRef}
        ></svg>
      </section>

      <section>
        <div>
          isForceCollideActive
          <input
            type="checkbox"
            checked={isForceCollideActive}
            onChange={() => {
              setIsForceCollideActive(!isForceCollideActive);
            }}
          />
        </div>
        <div>
          x collide
          <input
            type="checkbox"
            checked={isXCollide}
            onChange={() => {
              setIsXCollide(!isXCollide);
            }}
          />
        </div>
        <div>
          y collide
          <input
            type="checkbox"
            checked={isYCollide}
            onChange={() => {
              setIsYCollide(!isYCollide);
            }}
          />
        </div>

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
          Link Distance
          <input
            type="number"
            step={LINK_DISTANCE_STEP}
            min={-LINK_DISTANCE_BOUNDARY}
            max={LINK_DISTANCE_BOUNDARY}
            value={linkDistance}
            onChange={(event) => setLinkDistance(Number(event.target.value))}
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
