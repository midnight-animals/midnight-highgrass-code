https://www.d3indepth.com/force-layout/
If our data has a numeric dimension we can use forceX or forceY to position elements along an axis:
  .force('x', d3.forceX().x(function(d) {
    return xScale(d.value);
  }))
  .force('y', d3.forceY().y(function(d) {
    return 0;
  }))

# at
In this example, forceManyBody pushes all the nodes together, forceX attracts the nodes to particular x-coordinates and forceCollide stops the nodes intersecting.
