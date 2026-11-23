"use client";

import { useEffect, useRef } from "react";

/**
 * The studio's ink field.
 *
 * A single full-screen fragment shader: domain-warped fBm produces ink that
 * blooms through warm paper fibres, with electric filaments at the wet edge.
 * It is deliberately paper-and-ink rather than a space nebula — the brand is
 * print, and the motion is the ink still moving.
 *
 * Cost control: DPR capped at 1.5, the loop stops when the canvas leaves the
 * viewport, and `prefers-reduced-motion` renders exactly one frame.
 */

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;

out vec4 outColor;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;
uniform float uScroll;
uniform float uIntensity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = rot * p * 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  p.y = -p.y;

  // Scroll pushes the camera through the ink; the pointer drags it sideways.
  float zoom = 1.0 / max(0.32, 1.0 - uScroll * 0.55);
  p *= 0.92 * zoom;
  p += uPointer * 0.16 * zoom;

  float t = uTime * 0.024;

  // Domain warp: q warps the field, r warps it again. This is what makes it
  // read as liquid ink instead of clouds.
  vec2 q;
  q.x = fbm(p * 1.15 + vec2(0.0, t));
  q.y = fbm(p * 1.15 + vec2(5.2, 1.3 - t));

  vec2 r;
  r.x = fbm(p * 1.05 + 3.4 * q + vec2(1.7, 9.2) + t * 1.7);
  r.y = fbm(p * 1.05 + 3.4 * q + vec2(8.3, 2.8) + t * 1.4);

  float f = fbm(p + 3.2 * r);

  // Wet edge of the ink.
  float edge = length(r - 0.5);

  vec3 deep    = vec3(0.031, 0.031, 0.027);
  vec3 mid     = vec3(0.086, 0.082, 0.070);
  vec3 paper   = vec3(0.965, 0.945, 0.906);
  vec3 electric = vec3(0.184, 0.294, 1.000);
  vec3 coral    = vec3(1.000, 0.353, 0.212);

  float pool = smoothstep(0.30, 0.78, f);
  vec3 col = mix(deep, mid, smoothstep(0.0, 0.55, f));
  col = mix(col, paper, pow(pool, 2.6) * 0.92);

  // Paper fibres catch the light only where the ink is thinning.
  float fibre = vnoise(p * vec2(90.0, 26.0) + q * 4.0);
  col += paper * fibre * 0.035 * pool;

  // Electric filaments live in the wet edge, not across the whole field.
  float band = smoothstep(0.40, 0.47, edge) * (1.0 - smoothstep(0.47, 0.62, edge));
  col += electric * band * 0.55 * uIntensity;

  // A low coral ember in the deepest pools keeps the dark from going flat.
  col = mix(col, coral * 0.55, smoothstep(0.70, 0.98, f) * 0.16);

  // Ink grain, fixed to screen space so it reads as paper texture.
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.035;

  // Cinematic falloff.
  float vign = smoothstep(1.30, 0.18, length(uv - 0.5));
  col *= mix(0.42, 1.0, vign);

  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Surfaced in dev only; the component falls back to the CSS plate.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[VoidField]", gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function VoidField({
  className = "",
  intensity = 1,
}: {
  className?: string;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.dataset.vf = "start";

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      canvas.dataset.fallback = "true";
      canvas.dataset.vf = "no-gl";
      return;
    }
    canvas.dataset.vf = "gl";

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      canvas.dataset.fallback = "true";
      canvas.dataset.vf = "no-shader";
      return;
    }
    canvas.dataset.vf = "shader";

    const program = gl.createProgram();
    if (!program) {
      canvas.dataset.vf = "no-program";
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.dataset.fallback = "true";
      canvas.dataset.vf = `link-fail:${gl.getProgramInfoLog(program) ?? ""}`.slice(0, 160);
      return;
    }
    canvas.dataset.vf = "linked";
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");
    const uScroll = gl.getUniformLocation(program, "uScroll");
    const uIntensity = gl.getUniformLocation(program, "uIntensity");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const nextWidth = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const nextHeight = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let scroll = 0;
    let targetScroll = 0;

    const onPointer = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      const rect = canvas.getBoundingClientRect();
      const span = rect.height + window.innerHeight;
      const progress = (window.innerHeight - rect.top) / span;
      targetScroll = Math.min(1, Math.max(0, progress));
    };

    let raf = 0;
    let running = true;
    const start = performance.now();

    const draw = (now: number) => {
      if (!running) return;

      pointerX += (targetX - pointerX) * 0.045;
      pointerY += (targetY - pointerY) * 0.045;
      scroll += (targetScroll - scroll) * 0.06;

      resize();
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uPointer, pointerX, pointerY);
      gl.uniform1f(uScroll, scroll);
      gl.uniform1f(uIntensity, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    onScroll();
    raf = requestAnimationFrame(draw);
    canvas.dataset.vf = `running:${width}x${height}`;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible && !running) {
          running = true;
          raf = requestAnimationFrame(draw);
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(canvas);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [intensity]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Static plate: first paint, no-WebGL, and reduced-motion all get this. */}
      <div className="void-fallback absolute inset-0" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_20%,rgba(6,6,5,0.55)_100%)]" />
    </div>
  );
}
