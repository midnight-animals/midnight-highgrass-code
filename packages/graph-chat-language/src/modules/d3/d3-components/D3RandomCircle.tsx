import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { useInterval } from '../../../hooks/useInterval';

export const RandomCircle = () => {
  const [dataset, setDataset] = useState(generateDataset());
  useInterval(() => {
    const newDataset = generateDataset();
    setDataset(newDataset);
  }, 2000);
  return (
    <svg viewBox="0 0 100 50">
      {dataset.map(([x, y]) => (
        <circle cx={x} cy={y} r="3" />
      ))}
    </svg>
  );
};

export const D3RandomCircle = () => {
  const ref = useRef<SVGSVGElement>(null);
  const [dataset, setDataset] = useState(generateDataset());

  useEffect(() => {
    const svgElement = d3.select(ref.current);
    svgElement
      .selectAll('circle')
      .data(dataset)
      .join('circle')
      .attr('cx', (d) => d[0])
      .attr('cy', (d) => d[1])
      .attr('r', 3);
  }, [dataset]);

  useInterval(() => {
    const newDataset = generateDataset();
    setDataset(newDataset);
  }, 2000);

  return <svg viewBox="0 0 100 50" ref={ref} />;
};

function generateDataset() {
  const dataset = Array.from({ length: 50 }, () => [
    Math.random() * 100, // x coordinate
    Math.random() * 50, // y coordinate
  ]);
  return dataset;
}
