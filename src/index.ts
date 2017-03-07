import * as _ from 'lodash';

const canvasWidth = 500;
const canvasHeight = 300;
const dpr = 2;
const CANVAS_BACKGROUND_COLOR = '#dedede';

document.body.style.overflow = 'hidden';

const textarea = document.createElement('textarea');
textarea.style.position = 'absolute';
textarea.style.top = '0';
textarea.style.left = '0';
textarea.style.resize = 'none';
textarea.style.padding = '0';
textarea.style.boxSizing = 'border-box';
textarea.style.fontFamily = 'sans-serif';
textarea.style.fontSize = '11px';
document.body.appendChild(textarea);

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

type EditingColumn = { row: number, column: number };
let editingColumn: EditingColumn | null = null;

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

const rows = _.range(1, 1001).map((i) => [`(0, ${i})`, `(1, ${i})`, `(2, ${i})`, `(3, ${i})`, `(4, ${i})`]);
const rowHeight = 15;
let scrollOffset = 0;
const MAX_SCROLL_OFFSET = rows.length * rowHeight - canvasHeight + columnHeaderHeight;
console.debug(`MAX_SCROLL_OFFSET = ${MAX_SCROLL_OFFSET}`);

textarea.style.width = `${columnWidth}px`;
textarea.style.height = `${rowHeight}px`;

const draw = () => {
  console.debug(`Drawing for scrollOffset = ${scrollOffset}`);

  // clear the first column
  ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
  ctx.fillRect(0, columnHeaderHeight + 0.5, columnWidth, canvasHeight - columnHeaderHeight);

  const firstFullRowIndex = Math.floor(scrollOffset / rowHeight);
  const firstPartialRowHeight = scrollOffset % rowHeight;
  const maxNumberOfRowsToDraw = Math.round((canvasHeight - columnHeaderHeight) / rowHeight) + 0.5;
  const tableWidth = columnWidth * columnHeaders.length;

  console.debug(`firstFullRowIndex = ${firstFullRowIndex} maxNumberOfRowsToDraw = ${maxNumberOfRowsToDraw}`);

  if (
    editingColumn &&
    editingColumn.row >= firstFullRowIndex &&
    editingColumn.row <= firstFullRowIndex + maxNumberOfRowsToDraw // &&
    // textarea.style.display === 'none'
  ) {
    // textarea.style.display = 'block';
  } else {
    textarea.style.transform = `translate3d(0px, -50px, 0)`;
  }

  for (let i = 0; i < maxNumberOfRowsToDraw; i++) {
    if (i === 0) {
      ctx.save();
      // clip the first row
      ctx.rect(0, columnHeaderHeight, tableWidth, rowHeight)
      ctx.clip();
    }

    const elementIndex = (i + firstFullRowIndex);
    const cellBackgroundColor = elementIndex % 2 === 0 ? '#c0c0c0' : '#fefefe';
    console.assert(rows[elementIndex] != undefined, 'row exists');
    const rowData = rows[elementIndex];
    console.assert(rowData.length === columnHeaders.length);
    
    ctx.fillStyle = cellBackgroundColor;
    const y = columnHeaderHeight - firstPartialRowHeight + i * rowHeight;
    // draw row background
    ctx.fillRect(0, y, tableWidth, rowHeight);

    ctx.fillStyle = '#000000';
    ctx.font = '11px sans-serif';

    for (const [colIndex, column] of rowData.entries()) {
      ctx.fillText(rowData[colIndex], columnWidth * colIndex + padding, y + 3 /* to align the text vertically centered */);

      if (editingColumn && editingColumn.row === i + firstFullRowIndex && editingColumn.column === colIndex) {
        // textarea.style.left = `${canvas.offsetLeft + columnWidth * colIndex + padding}px`;
        // textarea.style.top = `${y + canvas.offsetTop}px`;

        const left = canvas.offsetLeft + columnWidth * colIndex + padding;
        const top = y + canvas.offsetTop;
        textarea.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        textarea.value = rowData[colIndex];
        textarea.focus();
      }
    }

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

canvas.addEventListener('click', (ev) => {
  ev.preventDefault()
  if (ev.button !== 0) {
    console.debug('ignoring non primary button click');
    return;
  }
  const t = (ev.currentTarget as HTMLCanvasElement);
  const p = { x: ev.clientX - t.offsetLeft, y: ev.clientY - t.offsetTop};

  const valueClickY = scrollOffset - columnHeaderHeight + p.y;
  const firstFullRowIndex = Math.floor(valueClickY / rowHeight);

  const column = Math.floor(p.x / columnWidth);
  console.log(rows[firstFullRowIndex][column]);

  editingColumn = { row: firstFullRowIndex, column: column };

  console.debug('clicked row: ', p);
  requestAnimationFrame(() => draw());
});

canvas.addEventListener('contextmenu', (ev) => {
  console.debug('ctx menu')
  ev.preventDefault()
})

document.body.addEventListener('keydown', (ev) => {
  if ((ev.target as any).tagName === 'TEXTAREA') {
    const textarea = ev.target as HTMLTextAreaElement;

    if (
      textarea.selectionStart === 0 &&
      textarea.selectionEnd === 0 && 
      (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft')
    ) {
      ev.preventDefault();
    }
    else if (
      textarea.selectionStart === textarea.value.length &&
      textarea.selectionEnd === textarea.value.length && 
      (ev.key === 'ArrowDown' || ev.key === 'ArrowRight')
    ) {
      ev.preventDefault();
    }
    else
    {
      // other keypress in text area, abort and let the browser continue editing
      return;
    }
  } else if (ev.key.indexOf('Arrow') === 0) {
    ev.preventDefault();
  }

  if (editingColumn) {
    switch (ev.key) {
      case 'ArrowUp':
      {
        if (editingColumn.row > 0) {
          editingColumn = {
            row: editingColumn.row - 1,
            column: editingColumn.column,
          };
        }
        break;
      }
      case 'ArrowDown':
      {
        if (editingColumn.row + 1 < rows.length) {
          editingColumn = {
            row: editingColumn.row + 1,
            column: editingColumn.column,
          };
        }
        break;
      }
      case 'ArrowLeft':
      {
        if (editingColumn.column > 0) {
          editingColumn = {
            row: editingColumn.row,
            column: editingColumn.column - 1,
          };
        }
        break;
      }
      case 'ArrowRight':
      {
        if (editingColumn.column + 1 < columnHeaders.length) {
          editingColumn = {
            row: editingColumn.row,
            column: editingColumn.column + 1,
          };
        }
        break;
      }
    }
  }

  // TODO: If below or above current view port -> scroll

  requestAnimationFrame(() => draw());
}, true);

requestAnimationFrame(() => draw());