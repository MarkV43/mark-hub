export class WebGLHelper {

  private _renderingContext: RenderingContext | null = null;
  private numVertices: number = 0;
  private width: number = 0;
  private height: number = 0;
  private aspectRatio: number = 0;
  private lastTime: number = 0;

  private get gl(): WebGLRenderingContext {
    return this._renderingContext as WebGLRenderingContext;
  }

  private get clientCanvas(): Element {
    return this.gl.canvas as Element;
  }

  private callback: ((gl: WebGLRenderingContext, program: WebGLProgram, data: any) => void) | null = null;
  private running = false;

  private shaderProgram: WebGLProgram | null = null;


  constructor() {
  }

  private loop() {
    if (this.running) {
      this.loopOnce();
      requestAnimationFrame(() => this.loop());
    }
  }

  loopOnce() {
    this.callback!(this.gl, this.shaderProgram!, {
      numVertices: this.numVertices,
      width: this.width,
      height: this.height,
      aspectRatio: this.aspectRatio,
      lastTime: this.lastTime,
    });
    this.lastTime = performance.now();
  }

  beginLoop() {
    this.running = true;
    this.loop();
  }

  stopLoop() {
    this.running = false;
  }

  setCallback(callback: (gl: WebGLRenderingContext, program: WebGLProgram, data: any) => void) {
    this.callback = callback;
  }

  startup(canvas: HTMLCanvasElement, fragmentShaderSrc: string, vertexShaderSrc: string): void {
    this._renderingContext = canvas.getContext('webgl2') || canvas.getContext("webgl") || canvas.getContext('experimental-webgl');

    if (!this.gl) {
      alert('Unable to initialize WebGL. Your browser may not support it.');
      return;
    }

    const shaderSet = [
      {
        type: this.gl.FRAGMENT_SHADER,
        code: fragmentShaderSrc,
      },
      {
        type: this.gl.VERTEX_SHADER,
        code: vertexShaderSrc,
      },
    ];

    this.shaderProgram = this.buildShaderProgram(shaderSet);

    this.resize();
  }

  private buildShaderProgram(shaderInfo: any): WebGLProgram {
    let program = this.gl.createProgram()!;

    shaderInfo.forEach((desc: any) => {
      let shader = this.compileShader(desc.code, desc.type);

      if (shader) {
        this.gl.attachShader(program, shader);
      }
    });

    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.log('Error linking shader program:');
      console.log(this.gl.getProgramInfoLog(program));
    }

    return program;
  }

  private compileShader(code: string, type: number): WebGLShader {
    let shader = this.gl.createShader(type)!;

    this.gl.shaderSource(shader, code);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.log(
        `Error compiling ${type === this.gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`,
        this.gl.getShaderInfoLog(shader),
        {code}
      );
    }
    return shader;
  }

  setVertexes(vertexes: Float32Array, numVertices: number) {
    const buffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexes, this.gl.STATIC_DRAW);
    this.numVertices = numVertices;
  }

  updateVertexes(vertexes: Float32Array) {
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, vertexes);
  }

  resize() {
    const density = window.devicePixelRatio;
    this.width = this.clientCanvas.clientWidth * density;
    this.height = this.clientCanvas.clientHeight * density;
    this.aspectRatio = this.width / this.height;
    this.gl.canvas.width = this.width;
    this.gl.canvas.height = this.height;
    this.gl.viewport(0, 0, this.width, this.height);
    if (this.callback) {
      this.loopOnce();
    }
  }
}
