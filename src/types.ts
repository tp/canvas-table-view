export interface RenderResult {
  width: number;
  height: number;
}

export interface RenderOptions {
  maxWidth: number;
  maxHeight: number;
}

export type UIElement<T> = (ctx: CanvasRenderingContext2D, options: RenderOptions, data: Readonly<T>) => Readonly<RenderResult>;