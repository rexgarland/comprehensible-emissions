const colors = require('./json/colors.json');
const plotConfig = require('./json/plot.json');
const data = require('./json/data.json');

const ui = {
  plot: document.getElementById('plot'),
  year: document.getElementById('year-input')
};

const svg = require('./svg');
const { Vec2 } = require('./math');

// utils

const thickness = 3;
const plotLine = (v1, v2) => svg.createLine(v1, v2, thickness, colors.grid.stroke)
const plotRect = (x,y,w,h,s,f) => svg.createRect(x,y,w,h,s,thickness,f)

// create grid

const svgBox = ui.plot.viewBox.baseVal;
const tickSize = 10;

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

let year = 2009;

function createPlot() {
  // creates and returns ui elements for later manipulation
  ui.plot.appendChild(plotLine(new Vec2(plotBox.x-tickSize, plotBox.y), new Vec2(plotBox.x+plotBox.width,plotBox.y)));
  ui.plot.appendChild(plotLine(new Vec2(plotBox.x, plotBox.y+tickSize), new Vec2(plotBox.x, plotBox.y-plotBox.height)));
  let x = 0;
  const i = year2Index(year);
  data.forEach(({region, emission, population}) => {
    const e = emission[i]/plotConfig.y.scale;
    const p = population[i]/plotConfig.x.scale;
    console.log(region,e/p,p);
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

