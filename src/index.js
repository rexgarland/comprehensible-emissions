const data = require('./json/data.json');

const config = require('./json/config.json');
const colors = config.colors;
const transforms = config.transforms;

const ui = {
  plot: document.getElementById('plot'),
  yearInput: document.getElementById('year-input'),
  yearDisplay: document.getElementById('year-display'),
};

const svg = require('./svg');
const { Vec2, range } = require('./math');

// utils

const thickness = 3;
const plotLine = (v1, v2) => svg.createLine(v1, v2, thickness, colors.grid.stroke)
const plotRect = (x,y,w,h,s,f) => svg.createRect(x,y,w,h,s,thickness,f)

// create grid

const svgBox = ui.plot.viewBox.baseVal;
const tickSize = {
  major: 10,
  minor: 6
}
const textSize = {
  height: 37,
  emHeight: 27,
  width: 16,
  offset: 10
}

const plotBox = {
  x: 140,
  y: 1090,
  width: 1904,
  height: 1076
}

function plot2svg(vec) {
  // maps plot space to svg space
  const x = (vec.x-config.x.grid.start)/(config.x.grid.stop-config.x.grid.start)*plotBox.width;
  const y = (vec.y-config.y.grid.start)/(config.y.grid.stop-config.y.grid.start)*plotBox.height;
  const offset = new Vec2(plotBox.x, plotBox.y);
  return offset.add(new Vec2(x,-y));
}

function year2Index(year) {
  return year-1990;
}

const startingYear = 1990;

function gridLine(v1, v2) {
  return svg.createLine(v1, v2, config.grid.thickness, colors.grid.stroke);
}

function createPlot() {

  // set up plot

  // x axis
  ui.plot.appendChild(gridLine(new Vec2(plotBox.x-tickSize.major, plotBox.y), new Vec2(plotBox.x+plotBox.width,plotBox.y)));
  range(0,config.x.grid.stop+1,config.x.grid.tick).forEach(i => {
    const start = plot2svg(new Vec2(i,0)).add(new Vec2(0,tickSize.major));
    const end = plot2svg(new Vec2(i,config.y.grid.stop));
    ui.plot.appendChild(gridLine(start, end));
    const t = svg.createText(start.x-textSize.width/2, start.y+textSize.emHeight+textSize.offset, `${i}`);
    t.className.baseVal = 'svg-axis-text';
    ui.plot.appendChild(t);
  })

  // y axis
  ui.plot.appendChild(gridLine(new Vec2(plotBox.x, plotBox.y+tickSize.major), new Vec2(plotBox.x, plotBox.y-plotBox.height)));
  range(0,config.y.grid.stop+1,config.y.grid.tick).forEach(i => {
    const start = plot2svg(new Vec2(0,i)).add(new Vec2(-tickSize.major,0));
    const end = plot2svg(new Vec2(config.x.grid.stop,i));
    ui.plot.appendChild(gridLine(start, end));
    const text = `${i}`;
    const t = svg.createText(start.x-textSize.width*text.length*1.2-textSize.offset, start.y+textSize.emHeight/2, text);
    t.className.baseVal = 'svg-legend-text';
    ui.plot.appendChild(t);
  })
  if (config.y.grid.minor) {
    range(0,config.y.grid.stop+1,config.y.grid.minor).forEach(i => {
      const end = plot2svg(new Vec2(0,i));
      const start = end.add(new Vec2(-tickSize.minor,0));
      ui.plot.appendChild(gridLine(start, end));
    })
  }

  // labels
  const xLabel = svg.createText(933, 1197, config.x.label);
  xLabel.className.baseVal = 'svg-label-text';
  ui.plot.appendChild(xLabel);
  const yLabel = svg.createText(43, 980, config.y.label);
  yLabel.className.baseVal = 'svg-label-text';
  yLabel.setAttribute('transform', 'translate(43 980) rotate(-90) translate(-43 -980)');
  ui.plot.appendChild(yLabel);

  // plot legend
  const bottomLeft = plot2svg(new Vec2(5,15));
  const topRight = plot2svg(new Vec2(6,20));
  const middleMiddle = bottomLeft.add(topRight.subtract(bottomLeft).multiply(0.5))
  ui.plot.appendChild(plotRect(bottomLeft.x,topRight.y,topRight.x-bottomLeft.x,bottomLeft.y-topRight.y,colors.legend.stroke,colors.legend.fill));
  const legendText = svg.createText(middleMiddle.x,middleMiddle.y+textSize.emHeight,config.legend);
  legendText.className.baseVal = 'svg-legend-text';
  ui.plot.appendChild(legendText);
  const legendTextBox = legendText.getBBox();
  legendText.setAttribute('x',legendTextBox.x-legendTextBox.width/2);
  legendText.setAttribute('y',legendTextBox.y+textSize.emHeight/2);

  // set up data

  const elements = data.map(({region})=> {
    const rect = svg.createRect(0,0,0,0,colors[region].stroke, colors[region].fill);
    const arrowHead = svg.createArrow(new Vec2(0,0), new Vec2(1,1), '');
    const arrowLine = svg.createLine(new Vec2(0,0), new Vec2(1,1), config.arrow.thickness);
    const arrow = {arrowHead, arrowLine};
    const text = svg.createText(0,0,'');
    return {rect, arrow, text}
  });
  elements.forEach(({rect}) => {
    ui.plot.appendChild(rect);
  });
  elements.forEach(({arrow, text}) => {
    const {arrowHead, arrowLine} = arrow;
    [arrowHead, arrowLine, text].forEach(e=>ui.plot.appendChild(e));
  });

  return elements;
}

// create plot elements
ui.data = createPlot();

function render(year) {
  const index = year2Index(year);
  range(0,data.length).reduce((x,i) => {

    const {rect, arrow, text} = ui.data[i];
    const {arrowHead, arrowLine} = arrow;

    // get data
    const {region, emission, population} = data[i];
    const e = emission[index]/config.y.scale;
    const p = population[index]/config.x.scale;
    const width = p;
    const height = e/p;

    // map to plot space
    const bottomLeft = plot2svg(new Vec2(x,0));
    const topRight = plot2svg(new Vec2(x+width,height));

    // update box
    svg.updateRect(bottomLeft.x, topRight.y, topRight.x-bottomLeft.x, bottomLeft.y-topRight.y, colors[region].stroke, config.box.thickness, colors[region].fill)(rect);
    
    // update arrow
    const arrowData = {
      position: topRight
        .add(new Vec2(1,-1).normalize().multiply(config.arrow.offset))
        .add(new Vec2(1,-1).normalize().multiply(config.arrow.size)),
      direction: new Vec2(-1,1),
      size: config.arrow.size
    };
    svg.updateArrow(arrowData.position, arrowData.direction, arrowData.size)(arrowHead);
    const p1 = arrowData.position;
    const p2 = p1.add(new Vec2(1,-1).normalize().multiply(config.arrow.length));
    svg.updateLine(p1, p2, config.arrow.thickness)(arrowLine);
    
    // update text
    const tStart = p2
      .add(new Vec2(1,-1).normalize().multiply(config.arrow.text.offset))
      .add(new Vec2(1,1).normalize().multiply(textSize.emHeight/2));
    svg.updateText(tStart.x,tStart.y,region)(text);
    text.className.baseVal = 'svg-region-text';
    if (Object.keys(transforms).includes(region)) {
      text.setAttribute('transform', `translate(${tStart.x},${tStart.y}) ${transforms[region]} translate(${-tStart.x},${-tStart.y})`);
    }
    
    return x+width;

  },0)

  ui.yearDisplay.innerHTML = year;
}

render(startingYear);

ui.yearInput.addEventListener('input', (e) => {
  const year = e.target.value;
  render(year);
});

