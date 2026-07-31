declare module "gif.js" {
  export default class GIF {
    constructor(options?: {
      workers?: number;
      quality?: number;
      workerScript?: string;
      width?: number;
      height?: number;
    });
    addFrame(
      canvas: HTMLCanvasElement | ImageData,
      options?: { delay?: number; copy?: boolean },
    ): void;
    on(event: "finished", cb: (blob: Blob) => void): void;
    on(event: string, cb: (...args: unknown[]) => void): void;
    render(): void;
  }
}
