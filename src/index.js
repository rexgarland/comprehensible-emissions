const colors = require('./json/colors.json');
const plotConfig = require('./json/plot.json');
const data = require('./json/data.json');

const ui = {
  plot: document.getElementById('plot'),
  year: document.getElementById('year-input')
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
  height: 35,
  emHeight: 26,
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
  const x = (vec.x-plotConfig.x.grid.start)/(plotConfig.x.grid.stop-plotConfig.x.grid.start)*plotBox.width;
  const y = (vec.y-plotConfig.y.grid.start)/(plotConfig.y.grid.stop-plotConfig.y.grid.start)*plotBox.height;
  const offset = new Vec2(plotBox.x, plotBox.y);
  return offset.add(new Vec2(x,-y));
}

function year2Index(year) {
  return year-1990;
}

let year = 2000;

function createPlot() {

  // set up plot graphics
  ui.plot.appendChild(plotLine(new Vec2(plotBox.x-tickSize.major, plotBox.y), new Vec2(plotBox.x+plotBox.width,plotBox.y)));
  ui.plot.appendChild(plotLine(new Vec2(plotBox.x, plotBox.y+tickSize.major), new Vec2(plotBox.x, plotBox.y-plotBox.height)));
  // x axis
  range(0,plotConfig.x.grid.stop+1,plotConfig.x.grid.tick).forEach(i => {
    const start = plot2svg(new Vec2(i,0)).add(new Vec2(0,tickSize.major));
    const end = plot2svg(new Vec2(i,plotConfig.y.grid.stop));
    ui.plot.appendChild(plotLine(start, end));
    const t = svg.createText(start.x-textSize.width/2, start.y+textSize.height+textSize.offset, `${i}`);
    t.className.baseVal = 'svg-axis-text';
    ui.plot.appendChild(t);
  })
  
  
  // y axis
  range(0,plotConfig.y.grid.stop+1,plotConfig.y.grid.tick).forEach(i => {
    const start = plot2svg(new Vec2(0,i)).add(new Vec2(-tickSize.major,0));
    const end = plot2svg(new Vec2(plotConfig.x.grid.stop,i));
    ui.plot.appendChild(plotLine(start, end));
    const text = `${i}`;
    const t = svg.createText(start.x-textSize.width*text.length-textSize.offset, start.y+(textSize.emHeight-textSize.height)+textSize.height/2, text);
    t.className.baseVal = 'svg-axis-text';
    ui.plot.appendChild(t);
  })
  if (plotConfig.y.grid.minor) {
    range(0,plotConfig.y.grid.stop+1,plotConfig.y.grid.minor).forEach(i => {
      const end = plot2svg(new Vec2(0,i));
      const start = end.add(new Vec2(-tickSize.minor,0));
      ui.plot.appendChild(plotLine(start, end));
    })
  }

  // plot legend
  const bottomLeft = plot2svg(new Vec2(4,20));
  const topRight = plot2svg(new Vec2(5,25));
  const middleMiddle = bottomLeft.add(topRight.subtract(bottomLeft).multiply(0.5))
  ui.plot.appendChild(plotRect(bottomLeft.x,topRight.y,topRight.x-bottomLeft.x,bottomLeft.y-topRight.y,colors.legend.stroke,colors.legend.fill));
  ui.plot.appendChild(svg.createText(middleMiddle.x,middleMiddle.y,plotConfig.legend))

  // plot data
  let x = 0;
  const i = year2Index(year);
  data.forEach(({region, emission, population}) => {
    const e = emission[i]/plotConfig.y.scale;
    const p = population[i]/plotConfig.x.scale;
    // console.log(region,e/p,p);
    const v1 = plot2svg(new Vec2(x,0));
    const v2 = plot2svg(new Vec2(x+p,e/p));
    ui.plot.appendChild(plotRect(v1.x, v2.y, v2.x-v1.x, v1.y-v2.y, colors[region].stroke, colors[region].fill));
    x = x + p;
  });
}

// create plot elements
createPlot();

function render(year) {
  console.log(year);
}

ui.year.addEventListener('input', (e) => {
  render(e.target.value);
});

