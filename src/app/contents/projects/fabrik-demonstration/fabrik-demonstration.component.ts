import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {WebGLHelper} from "../../../classes/webgl.helper";
import fragmentShaderSrc from '../../../../assets/shaders/toucan-fragment-shader.glsl';
import vertexShaderSrc from '../../../../assets/shaders/toucan-vetex-shader.glsl';
import {Simulator} from '../../../../assets/wasm/fabrik-algorithm';
import {memory} from '../../../../assets/wasm/fabrik-algorithm/fabrik_algorithm_bg.wasm';

@Component({
  selector: 'app-fabrik-demonstration',
  templateUrl: './fabrik-demonstration.component.html',
  styleUrls: ['./fabrik-demonstration.component.scss']
})
export class FabrikDemonstrationComponent implements OnInit, AfterViewInit {

  @ViewChild('sceneCanvas')
  private canvas: ElementRef | null = null;

  private webglHelper: WebGLHelper;
  private simulator: Simulator;
  private timeScale = 1e-6; // 1e-3

  constructor() {
    this.webglHelper = new WebGLHelper();

    this.simulator = Simulator.new_strip(50, 2 * Math.PI / 50, 2, 10);
    // this.simulator = Simulator.new_grid(30, 15, -2, 2, -1, 1, 2, 3);
    // this.simulator.set_shuffle(false);
  }

  ngOnInit(): void {
    window.onresize = () => {
      this.webglHelper.resize();
    };
  }

  ngAfterViewInit() {
    if (!this.canvas) {
      alert("<canvas> not supplied! Cannot bind WebGL context!");
      return;
    }

    this.webglHelper.startup(this.canvas.nativeElement, fragmentShaderSrc, vertexShaderSrc);
    const sticksLen = this.simulator.sticks_len();
    const vertexes = new Float32Array(sticksLen * 2 * 2);
    this.webglHelper.setVertexes(vertexes, sticksLen * 2);

    this.webglHelper.setCallback((gl, program, data) => {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      const uScalingFactor =
        gl.getUniformLocation(program, "uScalingFactor");
      const uGlobalColor =
        gl.getUniformLocation(program, "uGlobalColor");
      const uRotationVector =
        gl.getUniformLocation(program, "uRotationVector");

      gl.uniform2fv(uScalingFactor, [0.3, 0.3*data.aspectRatio]);
      gl.uniform2fv(uRotationVector, [0, 1]);
      gl.uniform4fv(uGlobalColor, [0.1, 0.7, 0.2, 1.0]);

      const pointsPtr = this.simulator.points();
      const sticksPtr = this.simulator.sticks();

      const pointsLen = this.simulator.points_len();
      const sticksLen = this.simulator.sticks_len();

      const points = new Float32Array(memory.buffer, pointsPtr, pointsLen * 2);
      const sticks = new Uint32Array(memory.buffer, sticksPtr, sticksLen * 2);

      for (let i = 0; i < sticksLen; i++) {
        const start = sticks[i * 2];
        const end = sticks[i * 2 + 1];
        vertexes[i*4] = points[start * 2];
        vertexes[i*4+1] = points[start * 2 + 1];
        vertexes[i*4+2] = points[end * 2];
        vertexes[i*4+3] = points[end * 2 + 1];
      }

      this.webglHelper.updateVertexes(vertexes);

      const aVertexPosition =
        gl.getAttribLocation(program, "aVertexPosition");

      gl.enableVertexAttribArray(aVertexPosition);
      gl.vertexAttribPointer(aVertexPosition, 2,
        gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.LINES, 0, data.numVertices);

      // Calculate deltaTime

      const deltaTime = performance.now() - data.lastTime;

      this.simulator.update_points(deltaTime * this.timeScale);
      this.simulator.fabrik_adjust();
    });

    this.webglHelper.beginLoop();
  }

  @HostListener('window:resize', ['$event']) onResize(event: any) {
    this.webglHelper.resize();
  }
}
