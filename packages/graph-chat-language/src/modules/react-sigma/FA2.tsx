import React, { useEffect } from 'react';

import { SigmaContainer } from '@react-sigma/core';
import { useWorkerLayoutForceAtlas2 } from '@react-sigma/layout-forceatlas2';

import { GraphDefault } from './GraphDefault';

export const LayoutFA2: React.FC = () => {
  const Fa2: React.FC = () => {
    const { start, kill } = useWorkerLayoutForceAtlas2({
      settings: { slowDown: 10 },
    });

    useEffect(() => {
      // start FA2
      start();
      return () => {
        // Kill FA2 on unmount
        kill();
      };
    }, [start, kill]);

    return null;
  };

  return (
    <SigmaContainer style={{ height: '500px' }}>
      <GraphDefault order={100} probability={0.1} />
      <Fa2 />
    </SigmaContainer>
  );
};

export default LayoutFA2;
