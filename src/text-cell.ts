import * as types from './types';

export interface TextCellData {
  text: string;
  backgroundColor: string;
  textColor: string;
  font: string;
}

const TEXT_PADDING = 5;

export const TextCell: types.UIElement<TextCellData> = (ctx, renderOptions, data) => {

  // draw row background
  ctx.fillStyle = data.backgroundColor;
  ctx.fillRect(0, 0, renderOptions.maxWidth, renderOptions.maxHeight);

  ctx.fillStyle = data.textColor;
  ctx.font = data.font;

  ctx.fillText(data.text, TEXT_PADDING, renderOptions.maxHeight - 3 /* to align the text vertically centered */);

  return { width: renderOptions.maxWidth, height: renderOptions.maxHeight };
}