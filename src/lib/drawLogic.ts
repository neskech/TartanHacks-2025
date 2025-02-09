import Brush from "./brush";

interface Position {
  x: number;
  y: number;
}

export default class DrawLogic {
  static instance: DrawLogic;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private brush: Brush;
  private lastPos: Position | null;
  private undoStack: ImageData[];
  private redoStack: ImageData[];
  private isDrawing: boolean;
  private bSize: number;
  private cleanup: () => void;
  private strokeFinishedCallback: () => void;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number
  ) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d")!;
    this.brush = {
      size: 10,
      opacity: 1,
      color: [0, 0, 0, 255],
    };
    this.lastPos = null;
    this.isDrawing = false;
    this.canvas.width = width;
    this.canvas.height = height;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.strokeFinishedCallback = () => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.cleanup = () => {};

    this.context.fillStyle = "rgb(255, 255, 255)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = `rgb(${this.brush.color[0]}, ${this.brush.color[1]}, ${this.brush.color[2]}, ${this.brush.color[3]})`;
    this.context.strokeStyle = `rgb(${this.brush.color[0]}, ${this.brush.color[1]}, ${this.brush.color[2]}, ${this.brush.color[3]})`;
    this.context.lineWidth = this.brush.size;
    this.bSize = this.brush.size;
    this.context.lineCap = "round";
    this.undoStack = [];
    this.redoStack = [];
  }

  static initialize(canvas: HTMLCanvasElement, width: number, height: number) {
    DrawLogic.instance = new DrawLogic(canvas, width, height);
  }

  static isInitialized() {
    return DrawLogic.instance != null;
  }

  static getInstance() {
    return DrawLogic.instance;
  }

  public setupEvents() {
    const e1 = (e: PointerEvent) => this.startDraw(e);
    this.canvas.addEventListener("pointerdown", e1);

    const e2 = (e: PointerEvent) => this.draw(e);
    this.canvas.addEventListener("pointermove", e2);

    const e3 = (e: PointerEvent) => this.stopDraw(e);
    this.canvas.addEventListener("pointerup", e3);

    const e4 = (e: PointerEvent) => this.stopDraw(e);
    this.canvas.addEventListener("pointerleave", e4);

    this.cleanup = () => {
      this.canvas.removeEventListener("pointerdown", e1);
      this.canvas.removeEventListener("pointermove", e2);
      this.canvas.removeEventListener("pointerup", e3);
      this.canvas.removeEventListener("pointerleave", e4);
    };
  }

  public removeEvents() {
    this.cleanup();
  }

  public getContext() {
    return this.context;
  }
  public setBrush(brush: Brush) {
    this.brush = brush;
    this.context.strokeStyle = `rgb(${this.brush.color[0]}, ${this.brush.color[1]}, ${this.brush.color[2]}, ${this.brush.color[3]})`;
    this.context.lineWidth = this.brush.size;
    this.bSize = this.brush.size;
  }

  public saveToImage() {
    return this.canvas.toDataURL("image/png");
  }

  public clear() {
    this.context.fillStyle = "rgb(255, 255, 255)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = `rgb(${this.brush.color[0]}, ${this.brush.color[1]}, ${this.brush.color[2]}, ${this.brush.color[3]})`;
    this.undoStack = [];
    this.redoStack = [];
    this.strokeFinishedCallback();
  }

  public canUndo() {
    return this.undoStack.length > 0;
  }

  public canRedo() {
    return this.redoStack.length > 0;
  }

  public enableBrush() {
    this.context.strokeStyle = `rgb(${this.brush.color[0]}, ${this.brush.color[1]}, ${this.brush.color[2]}, ${this.brush.color[3]})`;
    this.context.lineWidth = this.brush.size;
  }

  public enableEraser() {
    this.context.strokeStyle = `rgb(255, 255, 255)`;
    this.context.lineWidth = this.brush.size * 12;
  }

  public drawImage(image: HTMLImageElement) {
    const widthScale = this.canvas.width / image.width;
    const heightScale = this.canvas.height / image.height;
    const scaleFactor = Math.min(widthScale, heightScale);

    const newWidth = image.width * scaleFactor;
    const newHeight = image.height * scaleFactor;
    this.context.drawImage(image, 0, 0, newWidth, newHeight)
  }

  public undo() {
    if (this.undoStack.length > 0) {
      const state = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.context.putImageData(this.undoStack.pop()!, 0, 0);
      this.redoStack.push(state);
    }
  }

  public redo() {
    if (this.redoStack.length > 0) {
      const state = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.context.putImageData(this.redoStack.pop()!, 0, 0);
      this.undoStack.push(state);
    }
  }

  public setStrokeFinishedCallback(callback: () => void) {
    this.strokeFinishedCallback = callback;
  }

  private startDraw(event: PointerEvent) {
    if (!this.isDrawing) {
      this.undoStack.push(
        this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
      );
    }
    this.isDrawing = true;

    const rect = this.canvas.getBoundingClientRect(); // Get canvas position and size
    const scaleX = this.canvas.width / rect.width; // Scale factor for X
    const scaleY = this.canvas.height / rect.height; // Scale factor for Y

    const currPos: Position = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };

    this.context.ellipse(
      currPos.x,
      currPos.y,
      this.brush.size,
      this.brush.size,
      0,
      0,
      2 * Math.PI
    );

    this.context.beginPath();
  }

  private draw(event: PointerEvent) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect(); // Get canvas position and size
    const scaleX = this.canvas.width / rect.width; // Scale factor for X
    const scaleY = this.canvas.height / rect.height; // Scale factor for Y

    const currPos: Position = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };

    this.context.lineTo(currPos.x, currPos.y);
    this.context.stroke();
    this.context.moveTo(currPos.x, currPos.y);

    this.lastPos = {
      x: event.offsetX,
      y: event.offsetY,
    };
  }

  private stopDraw(event: PointerEvent) {
    if (this.isDrawing) {
      this.strokeFinishedCallback();
    }
    this.isDrawing = false;
    this.lastPos = null;
  }
}
