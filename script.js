// If v1 and v2 are two distinct points on one line, and w1 and w2 are two
// distinct points on some other (non-parallel) line, this function returns
// the unique point where the two lines meet.
function findIntersection(v1, v2, w1, w2) {
  var a = v1.x - v2.x;
  var b = w2.x - w1.x;
  var c = v1.y - v2.y;
  var d = w2.y - w1.y;

  var det = a*d - b*c;

  var bx = v1.x - w1.x;
  var by = v1.y - w1.y;

  var k1 = (d*bx - b*by) / det;

  return {
    x: v1.x + k1 * (v2.x - v1.x),
    y: v1.y + k1 * (v2.y - v1.y)
  };
}

// Euclidean distance between two points.
function distance(v, w) {
  return Math.sqrt(Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2));
}

function normalize(v) {
  var norm = distance(v, {x:0, y:0});
  return { x: v.x / norm, y: v.y / norm };
}

// Shift v away from w by the specified distance.
function shiftAwayBy(v, w, dist) {
  var d = normalize({ x: v.x - w.x, y: v.y - w.y });
  return {
    x: v.x + dist * d.x,
    y: v.y + dist * d.y
  };
}


// Given absolute coordinates (the same as those returned by
// Element.getBoundingClientRect), return a path element representing an arrow
// between those coordinates.
function drawArrow(id, x1, y1, x2, y2) {
  var r = Math.round;

  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("class", "arrow");
  path.setAttribute("d", 'M' + r(x1) + ',' + r(y1) + ' L' + r(x2) + ',' + r(y2));
  return path;
}

function makePath(elFrom, elTo) {
  var fromLeft = elFrom.offsetLeft;
  var fromRight = elFrom.offsetLeft + elFrom.offsetWidth;
  var fromTop = elFrom.offsetTop;
  var fromBottom = elFrom.offsetTop + elFrom.offsetHeight;
  var fromC = {
    x: (fromLeft + fromRight) / 2, 
    y: (fromTop + fromBottom) / 2, 
  };

  var toLeft = elTo.offsetLeft;
  var toRight = elTo.offsetLeft + elTo.offsetWidth;
  var toTop = elTo.offsetTop;
  var toBottom = elTo.offsetTop + elTo.offsetHeight;
  var toC = {
    x: (toLeft + toRight) / 2, 
    y: (toTop + toBottom) / 2, 
  };

  var angle = Math.atan2(toC.y - fromC.y, toC.x - fromC.x);

  // Is the arrow pointing to the left or the right?
  var isRight = (-0.5 * Math.PI) < angle && angle < (0.5 * Math.PI);
  // Is the arrow pointing down or up?
  var isDown = angle > 0;

  // Find start and finish points, which are the intersections of the
  // boundaries of the boxes with the arrow directly connecting their centres.
  var startVertX = isRight ? fromRight : fromLeft;
  var startHorzY = isDown ? fromBottom : fromTop;

  var startVert = findIntersection(
    fromC, toC,
    { x: startVertX, y: fromTop }, { x: startVertX, y: fromBottom });
  var startHorz = findIntersection(
    fromC, toC,
    { x: fromLeft, y: startHorzY }, { x: fromRight, y: startHorzY });

  var vertDist = distance(fromC, startVert);
  var horzDist = distance(fromC, startHorz);
  var startPoint;

  if (isNaN(vertDist)) {
    startPoint = startHorz;
  } else if (isNaN(horzDist)) {
    startPoint = startVert;
  } else {
    startPoint = vertDist < horzDist ? startVert : startHorz;
  }

  var finishVertX = isRight ? toLeft : toRight;
  var finishHorzY = isDown ? toTop : toBottom;

  var finishVert = findIntersection(
    fromC, toC,
    { x: finishVertX, y: toTop }, { x: finishVertX, y: toBottom });
  var finishHorz = findIntersection(
    fromC, toC,
    { x: toLeft, y: finishHorzY }, { x: toRight, y: finishHorzY });

  vertDist = distance(toC, finishVert);
  horzDist = distance(toC, finishHorz);
  var finishPoint;

  if (isNaN(vertDist)) {
    finishPoint = finishHorz;
  } else if (isNaN(horzDist)) {
    finishPoint = finishVert;
  } else {
    finishPoint = vertDist < horzDist ? finishVert : finishHorz;
  }

  return pathString(
    shiftAwayBy(startPoint, fromC, 5),
    shiftAwayBy(finishPoint, toC, 5));
}

function pathString(v, w) {
  return "M" + v.x + "," + v.y + " L" + w.x + "," + w.y;
}

function go() {
  var svg = document.getElementById('svg-arrows');
  var container = svg.parentNode;
  svg.setAttribute("viewBox",
    "0 0 " + container.clientWidth + " " + container.clientHeight);

  var arrows = document.querySelectorAll('svg > path');
  arrows.forEach(function(a) {
    var fromEl = document.getElementById(a.getAttribute('data-from'));
    var toEl = document.getElementById(a.getAttribute('data-to'));
    a.setAttribute('d', makePath(fromEl, toEl));
  });
}

go();

window.onresize = go;

// Resize our arrows after MathJax rendering
if (MathJax) {
  MathJax.Hub.Register.StartupHook("End", go);
}
