

function createLinearSpan(a, b, num, inclusive=true) {
  let array = [];
  const d = inclusive ? (b-a)/(num-1) : (b-a)/num;
  for (let i=0; i<num; i++) {
    array = array.concat(i*d+a);
  }
  return array;
}

class Vec2 {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
  rotate(angle) {
    const rad = Math.PI*angle/180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const newX = this.x*cos - this.y*sin;
    const newY = this.x*sin + this.y*cos;
    return new Vec2(newX, newY);
  }
  add(vec) {
    return new Vec2(this.x+vec.x, this.y+vec.y);
  }
  subtract(vec) {
    return new Vec2(this.x-vec.x, this.y-vec.y);
  }
  multiply(s) {
    return new Vec2(this.x*s, this.y*s);
  }
  dot(vec) {
    return vec.x*this.x + vec.y*this.y;
  }
  length() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }
  normalize() {
    const length = this.length();
    return new Vec2(this.x/length, this.y/length);
  }
}

function range(a,b,step=1) {
  const array = [];
  for (let i=a; i<b; i = i + step) {
    array.push(i);
  }
  return array;
}

module.exports = {
  Vec2,
  range
}