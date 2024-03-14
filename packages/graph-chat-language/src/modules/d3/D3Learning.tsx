import {
  AnimatedCircles,
  D3AnimatedCircles,
} from './d3-components/D3AnimatedCircles';
import { D3Circle } from './d3-components/D3Circle';
import { D3RandomCircle } from './d3-components/D3RandomCircle';
import { D3ForceSimulation } from './d3-components/ForceSimulation';
import { D3Svg } from './d3-components/d3Svg';

export const D3Learning: React.FC = (): JSX.Element => {
  return (
    <>
      <D3ForceSimulation />
      {/* <D3AnimatedCircles /> */}
      {/* <AnimatedCircles /> */}
      {/* <D3RandomCircle /> */}
      {/* <D3Svg /> */}
      {/* <D3Circle /> */}
      {/* <LinePlot data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} /> */}
    </>
  );
};
