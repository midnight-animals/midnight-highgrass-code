import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

export function runForceGraph(
  container,
  linksData,
  nodesData,
  nodeHoverTooltip,
) {
  const links = linksData.map((d) => Object.assign({}, d));
  const nodes = nodesData.map((d) => Object.assign({}, d));

  const containerRect = container.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;

  const color = () => {
    return '#9D79A0';
  };

  const icon = (d) => {
    return d.gender === 'male' ? 'm' : 'f';
  };

  const getClass = (d) => {
    return d.gender === 'male' ? 'male' : 'female';
  };

  const drag = (simulation) => {
    const dragstarted = (d) => {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (d) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    };

    const dragended = (d) => {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  // Add the tooltip element to the graph
  const tooltip = document.querySelector('#graph-tooltip');
  if (!tooltip) {
    const tooltipDiv = document.createElement('div');
    tooltipDiv.classList.add('tooltip');
    tooltipDiv.style.opacity = '0';
    tooltipDiv.id = 'graph-tooltip';
    document.body.appendChild(tooltipDiv);
  }
  const div = d3.select('#graph-tooltip');

  const addTooltip = (hoverTooltip, d, x, y) => {
    div.transition().duration(200).style('opacity', 0.9);
    div
      .html(hoverTooltip(d))
      .style('left', `${x}px`)
      .style('top', `${y - 28}px`);
  };

  const removeTooltip = () => {
    div.transition().duration(200).style('opacity', 0);
  };

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3.forceLink(links).id((d) => d.id),
    )
    .force('charge', d3.forceManyBody().strength(-150))
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  const svg = d3
    .select(container)
    .append('svg')
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .call(
      d3.zoom().on('zoom', function () {
        svg.attr('transform', d3.event.transform);
      }),
    );

  const link = svg
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', (d) => Math.sqrt(d.value));

  const node = svg
    .append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 12)
    .attr('fill', color)
    .call(drag(simulation));

  const label = svg
    .append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('class', (d) => `fa ${getClass(d)}`)
    .text((d) => {
      return icon(d);
    })
    .call(drag(simulation));

  label
    .on('mouseover', (d) => {
      addTooltip(nodeHoverTooltip, d, d3.event.pageX, d3.event.pageY);
    })
    .on('mouseout', () => {
      removeTooltip();
    });

  simulation.on('tick', () => {
    //update link positions
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    // update node positions
    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    // update label positions
    label
      .attr('x', (d) => {
        return d.x;
      })
      .attr('y', (d) => {
        return d.y;
      });
  });

  return {
    destroy: () => {
      simulation.stop();
    },
    nodes: () => {
      return svg.node();
    },
  };
}

export function runForceGraphPixi(
  container,
  linksData,
  nodesData,
  nodeHoverTooltip,
) {
  const links = linksData.map((d) => Object.assign({}, d));
  const nodes = nodesData.map((d) => Object.assign({}, d));

  const containerRect = container.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;
  let dragged = false;

  container.innerHTML = '';

  const color = () => {
    return '#f0f8ff';
  };

  // Add the tooltip element to the graph
  const tooltip = document.querySelector('#graph-tooltip');
  if (!tooltip) {
    const tooltipDiv = document.createElement('div');
    tooltipDiv.classList.add('tooltip');
    tooltipDiv.style.opacity = '0';
    tooltipDiv.id = 'graph-tooltip';
    document.body.appendChild(tooltipDiv);
  }
  const div = d3.select('#graph-tooltip');

  const addTooltip = (hoverTooltip, d, x, y) => {
    div.transition().duration(200).style('opacity', 0.9);
    div
      .html(hoverTooltip(d))
      .style('left', `${x}px`)
      .style('top', `${y - 28}px`);
  };

  const removeTooltip = () => {
    div.transition().duration(200).style('opacity', 0);
  };

  const colorScale = (num) => parseInt(color().slice(1), 16);

  function onDragStart(evt) {
    viewport.plugins.pause('drag');
    simulation.alphaTarget(0.3).restart();
    this.isDown = true;
    this.eventData = evt.data;
    this.alpha = 0.5;
    this.dragging = true;
  }

  function onDragEnd(evt) {
    evt.stopPropagation();
    if (!evt.active) simulation.alphaTarget(0);
    this.alpha = 1;
    this.dragging = false;
    this.isOver = false;
    this.eventData = null;
    viewport.plugins.resume('drag');
  }

  function onDragMove(gfx) {
    if (gfx.dragging) {
      dragged = true;
      const newPosition = gfx.eventData.getLocalPosition(gfx.parent);
      this.x = newPosition.x;
      this.y = newPosition.y;
    }
  }

  const app = new PIXI.Application({
    width,
    height,
    antialias: !0,
    transparent: !0,
    resolution: 1,
  });
  container.appendChild(app.view);

  // create viewport
  const viewport = new Viewport({
    screenWidth: width,
    screenHeight: height,
    worldWidth: width * 4,
    worldHeight: height * 4,
    passiveWheel: false,

    interaction: app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
  });

  app.stage.addChild(viewport);

  // activate plugins
  viewport
    .drag()
    .pinch()
    .wheel()
    .decelerate()
    .clampZoom({ minWidth: width / 4, minHeight: height / 4 });

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links) // This force provides links between nodes
        .id((d) => d.id) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
        .distance(50),
    )
    .force('charge', d3.forceManyBody().strength(-500)) // This adds repulsion (if it's negative) between nodes.
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3
        .forceCollide()
        .radius((d) => d.radius)
        .iterations(2),
    )
    .velocityDecay(0.8);

  /*
   Implementation
   */

  let visualLinks = new PIXI.Graphics();
  viewport.addChild(visualLinks);

  nodes.forEach((node) => {
    const boundDrag = onDragMove.bind(node);
    const { name, gender } = node;
    node.gfx = new PIXI.Graphics();
    node.gfx.lineStyle(1, 0xd3d3d3);
    node.gfx.beginFill(colorScale(node.id));
    node.gfx.drawCircle(0, 0, 24);
    node.gfx.endFill();
    node.gfx
      // events for click
      .on('click', (e) => {
        if (!dragged) {
          e.stopPropagation();
        }
        dragged = false;
      })
      .on('mousedown', onDragStart)
      // events for drag end
      .on('mouseup', onDragEnd)
      .on('mouseupoutside', onDragEnd)
      // events for drag move
      .on('mousemove', () => boundDrag(node.gfx));

    viewport.addChild(node.gfx);

    node.gfx.interactive = true;
    node.gfx.buttonMode = true;

    // create hit area, needed for interactivity
    node.gfx.hitArea = new PIXI.Circle(0, 0, 24);

    // show tooltip when mouse is over node
    node.gfx.on('mouseover', (mouseData) => {
      addTooltip(
        nodeHoverTooltip,
        { name },
        mouseData.data.originalEvent.pageX,
        mouseData.data.originalEvent.pageY,
      );
    });

    // make circle half-transparent when mouse leaves
    node.gfx.on('mouseout', () => {
      removeTooltip();
    });

    const text = new PIXI.Text(name, {
      fontSize: 12,
      fill: '#000',
    });
    text.anchor.set(0.5);
    text.resolution = 2;
    node.gfx.addChild(text);
  });

  const ticked = () => {
    nodes.forEach((node) => {
      let { x, y, gfx } = node;
      gfx.position = new PIXI.Point(x, y);
    });

    for (let i = visualLinks.children.length - 1; i >= 0; i--) {
      visualLinks.children[i].destroy();
    }

    visualLinks.clear();
    visualLinks.removeChildren();
    visualLinks.alpha = 1;

    links.forEach((link) => {
      let { source, target, number } = link;
      visualLinks.lineStyle(2, 0xd3d3d3);
      visualLinks.moveTo(source.x, source.y);
      visualLinks.lineTo(target.x, target.y);
    });

    visualLinks.endFill();
  };

  // Listen for tick events to render the nodes as they update in your Canvas or SVG.
  simulation.on('tick', ticked);

  return {
    destroy: () => {
      simulation.stop();
      nodes.forEach((node) => {
        node.gfx.clear();
      });
      visualLinks.clear();
    },
  };
}
