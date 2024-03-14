import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { useInterval } from '../../../hooks/useInterval';
import { animated, useSpring } from 'react-spring';
import {
  generateCircles,
  generateRandom,
  getRandomElements,
  getRandomFromInterval,
} from '../../random';

const allCircles = generateRandom(10);

export const AnimatedCircles = () => {
  const [visibleCircles, setVisibleCircles] = useState(allCircles);

  useInterval(() => {
    const newCircles = getRandomElements(
      allCircles,
      getRandomFromInterval(4, 5),
    );
    setVisibleCircles(newCircles);
  }, 1000);

  return (
    <svg viewBox="0 0 100 20">
      {allCircles.map((d, i) => {
        return (
          <AnimatedCircle
            key={i}
            x={d}
            isShowing={visibleCircles.includes(d)}
          />
        );
      })}
    </svg>
  );
};

const AnimatedCircle: React.FC<{ x: number; isShowing: boolean }> = ({
  x,
  isShowing,
}) => {
  const wasShowing = useRef(false);
  useEffect(() => {
    wasShowing.current = isShowing;
  }, [isShowing]);

  const style = useSpring({
    config: {
      duration: 1200,
    },
    r: isShowing ? 2 : 0,
    opacity: isShowing ? 1 : 0,
  });

  return (
    <animated.circle
      {...style}
      cx={x * 105 + 10}
      cy="10"
      fill={
        !isShowing
          ? 'tomato'
          : !wasShowing.current
          ? 'cornflowerblue'
          : 'lightgrey'
      }
    />
  );
};

export const D3AnimatedCircles = () => {
  const ref = useRef<SVGSVGElement>(null);
  const [visibleCircles, setVisibleCircles] = useState(generateCircles());
  useInterval(() => {
    setVisibleCircles(generateCircles());
  }, 2000);

  useEffect(() => {
    const svgElement = d3.select(ref.current);
    svgElement
      .selectAll('circle')
      .data(visibleCircles, (d) => d)
      .join(
        (enter) =>
          enter
            .append('circle')
            .attr('cx', (d) => d * 105 + 10)
            .attr('cy', 10)
            .attr('r', 0)
            .attr('fill', 'cornflowerblue')
            .call((enter) =>
              enter
                .transition()
                .duration(1200)
                .attr('cy', 10)
                .attr('r', 2)
                .style('opacity', 1),
            ),
        (update) => update.attr('fill', 'lightgrey'),
        (exit) =>
          exit
            .attr('fill', 'tomato')
            .call((exit) =>
              exit
                .transition()
                .duration(1200)
                .attr('r', 0)
                .style('opacity', 0)
                .remove(),
            ),
      );
  }, [visibleCircles]);

  return <svg viewBox="0 0 100 20" ref={ref} />;
};
