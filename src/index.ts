import * as _ from 'lodash';

const canvasWidth = 500;
const canvasHeight = 300;
const dpr = 2;
const CANVAS_BACKGROUND_COLOR = '#dedede';

document.body.style.overflow = 'hidden';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = canvasWidth * dpr;
canvas.height = canvasHeight * dpr;
canvas.style.width = `${canvasWidth}px`;
canvas.style.height = `${canvasHeight}px`;

const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('No ctx');
}

ctx.scale(dpr, dpr);

ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
ctx.fillRect(0, 0, canvasWidth, canvasHeight)

ctx.beginPath();
ctx.moveTo(50, 50);
ctx.lineTo(Math.random() * 50, Math.random() * 50);
ctx.stroke();


/// Drawing the column headers, evenly spaced

const columnHeaders = ['Col 1', 'Column Title 2', 'Some Really Long Title That Should Be Elipsed', 'Column 4', 'Column 5'];
const columnWidth = canvasWidth / columnHeaders.length;
const columnHeaderHeight = 20;
const fontHeight = 13;
const padding = 3;

ctx.font = `normal normal 200 ${fontHeight}px sans-serif`;
ctx.textBaseline = 'top';
for (const [i, title] of columnHeaders.entries()) {
  // clear title area
  ctx.fillStyle = '#dedede';
  ctx.fillRect(i * columnWidth, 0, columnWidth, columnHeaderHeight);

  // draw title text
  ctx.fillStyle = '#000000';
  ctx.fillText(title, i * columnWidth + padding, columnHeaderHeight - fontHeight);

  // draw divider
  if (i < columnHeaders.length - 1) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(i * columnWidth + columnWidth - 1, 0, 0.5, columnHeaderHeight);
  }
}

ctx.strokeStyle = '#7c7c7c';
ctx.beginPath();
ctx.moveTo(0, columnHeaderHeight);
ctx.lineTo(canvasWidth, columnHeaderHeight);
ctx.stroke();

// canvas.addEventListener('touchstart', (ev) => {
//   console.log('touchstart on canvas')
//   debugger;
//   ev.preventDefault()
//   ev.stopImmediatePropagation();
//   return false;
// });

const rows = _.range(1, 1001).map((i) => `Row #${i}`);
const rowHeight = 15;
let scrollOffset = 0;
const MAX_SCROLL_OFFSET = rows.length * rowHeight - canvasHeight + columnHeaderHeight;
console.debug(`MAX_SCROLL_OFFSET = ${MAX_SCROLL_OFFSET}`);

const draw = () => {
  console.debug(`Drawing for scrollOffset = ${scrollOffset}`);

  // clear the first column
  ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
  ctx.fillRect(0, columnHeaderHeight + 0.5, columnWidth, canvasHeight - columnHeaderHeight);

  const firstFullRowIndex = Math.floor(scrollOffset / rowHeight);
  const firstPartialRowHeight = scrollOffset % rowHeight;
  const maxNumberOfRowsToDraw = Math.round((canvasHeight - columnHeaderHeight) / rowHeight);

  console.debug(`firstFullRowIndex = ${firstFullRowIndex} maxNumberOfRowsToDraw = ${maxNumberOfRowsToDraw}`);

  for (let i = 0; i < maxNumberOfRowsToDraw; i++) {
    if (i === 0) {
      ctx.save();
      // clip the first row
      ctx.rect(0, columnHeaderHeight, columnWidth, rowHeight)
      ctx.clip();
    }

    const elementIndex = (i + firstFullRowIndex);
    const cellBackgroundColor = elementIndex % 2 === 0 ? '#c0c0c0' : '#fefefe';
    
    ctx.fillStyle = cellBackgroundColor;
    const y = columnHeaderHeight - firstPartialRowHeight + i * rowHeight;
    ctx.fillRect(0, y, columnWidth, rowHeight);
    ctx.fillStyle = '#000000';
    ctx.font = '11px sans-serif';
    console.assert(rows[elementIndex] != undefined, 'row exists');
    ctx.fillText(rows[elementIndex], padding, y + 3);

    if (i === 0) {
      // reset clip
      ctx.restore();
    }
  }
};

canvas.addEventListener('wheel', (ev) => {
  console.debug('mousewheel on canvas', ev.deltaY, ev.wheelDeltaY, ev.deltaMode === ev.DOM_DELTA_PIXEL)

  scrollOffset = Math.max(0, Math.min(scrollOffset + ev.deltaY, MAX_SCROLL_OFFSET));

  requestAnimationFrame(() => draw());
});

requestAnimationFrame(() => draw());