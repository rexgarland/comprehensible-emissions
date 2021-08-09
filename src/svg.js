function createCircle(r, fill="black") {
  const circle = document.createElementNS("http://www.w3.org/2000/svg",'circle');
  circle.setAttribute('r', r);
  circle.setAttribute('cx', 10);
  circle.setAttribute('cy', 10);
  circle.setAttribute('fill', fill);
  return circle;
}

function createPath(data, thickness=0.1, color="black") {
  const line = document.createElementNS("http://www.w3.org/2000/svg",'path');
  line.setAttribute('d', data);
  line.setAttribute('stroke-width', thickness);
  line.setAttribute('stroke', color);
  line.setAttribute('fill', "none");
  return line;
}

function createShape(data) {
  const shape = document.createElementNS("http://www.w3.org/2000/svg",'path');
  shape.setAttribute('d', data);
  shape.setAttribute('fill', "black");
  return shape;
}

function updateRect(x,y,width,height,stroke,thickness,fill) {
  return rect => {
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('stroke', stroke);
    rect.setAttribute('stroke-width', thickness);
    rect.setAttribute('fill', fill);
  }
}

function createRect(...args) {
  const rect = document.createElementNS("http://www.w3.org/2000/svg",'rect');
  updateRect(...args)(rect);
  return rect;
}

function updateLine(p1, p2, thickness=0.1, color="black") {
  return (line) => {
    const data = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
    line.setAttribute('d', data);
  }
}

function createLine(p1, p2, thickness=0.1, color="black") {
  const line = createPath('',thickness, color);
  updateLine(p1, p2, thickness, color)(line);
  return line;
}

function updateText(x,y,text) {
  return textElem => {
    textElem.setAttribute('x', x);
    textElem.setAttribute('y', y);
    textElem.innerHTML = text;
  }
}

function createText(...args) {
  const textElem = document.createElementNS("http://www.w3.org/2000/svg",'text');
  updateText(...args)(textElem);
  return textElem;
}

function updateArrow(position, direction, size) {
  direction = direction.normalize();
  const perp = direction.rotate(90);
  const relPositions = [perp.multiply(-size/3), direction.multiply(size), perp.multiply(size/3)];
  const absPositions = relPositions.map(v=>position.add(v));
  const data = `M ${position.x} ${position.y} ${absPositions.map(v=>`L ${v.x} ${v.y}`).join(' ')} Z`;
  return (arrow) => {
    arrow.setAttribute('d', data);
  }
}

function createArrow(...args) {
  const arrow = createShape('');
  updateArrow(...args)(arrow);
  return arrow;
}

function createPlot(points) {
  const lines = points.slice(1).map(v=>`L ${v.x} ${v.y}`);
  const data = `M ${points[0].x} ${points[0].y} ${lines}`;
  return createPath(data);
}

module.exports = {
  createPath,
  createLine,
  updateLine,
  createShape,
  createArrow,
  updateArrow,
  createRect,
  updateRect,
  createText,
  updateText
}