import React from 'react';
import './App.scss';
import { SigmaLearning } from './modules/sigma/sigma-learning';
import { SigmaDemo } from './modules/sigma/sigma-demo/SigmaDemo';

function App() {
  return (
    <div className="App">
      <SigmaDemo />
      {/* <DragNdrop />
      <LayoutFA2 />
      <DisplayGraph /> */}
      {/* <MultiDirectedGraphView /> */}
      {/* <SigmaLearning /> */}
    </div>
  );
}

export default App;
