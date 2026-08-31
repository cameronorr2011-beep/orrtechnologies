"use client";

import { useEffect, useRef } from "react";

const VERT = `#version 300 es
precision highp float;
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_scroll;
uniform float u_phase;
uniform float u_warm;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
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
  float amp = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = rot * p * 2.02;
    amp *= 0.5;
  }
  return v;
}

// ridged filaments that read as drifting maple veins
float veins(vec2 p) {
  float n = fbm(p * 1.4);
  return 1.0 - abs(sin(n * 6.2831 + u_time * 0.06));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

  float t = u_time * 0.045;

  // parallax: cursor + scroll push the atmosphere in opposite directions
  vec2 drift = vec2(u_mouse.x * 0.14, -u_mouse.y * 0.10 - u_scroll * 0.55);
  p += drift;

  float q = fbm(p * 1.25 + vec2(t, -t * 0.6));
  float r = fbm(p * 1.9 + vec2(q * 1.6 - t * 0.8, q * 1.1 + t * 0.4));
  float density = fbm(p * 2.6 + r * 1.4);

  // ---- royal base ----
  vec3 deep    = vec3(0.027, 0.019, 0.062);
  vec3 royal   = vec3(0.145, 0.086, 0.329);
  vec3 violet  = vec3(0.376, 0.243, 0.678);
  vec3 ember   = vec3(0.886, 0.463, 0.184);
  vec3 gold    = vec3(1.0, 0.851, 0.627);

  vec3 col = mix(deep, royal, smoothstep(0.15, 0.95, density));
  col = mix(col, violet, smoothstep(0.45, 1.05, r) * 0.55);

  // ---- ember bloom low-right, royal bloom upper-left ----
  vec2 emberFocus = vec2(0.42 + u_mouse.x * 0.06, -0.34 + u_mouse.y * 0.05);
  float bloom = exp(-2.3 * length(p - emberFocus));
  float flick = 0.82 + 0.18 * sin(u_time * 0.9 + fbm(p * 4.0 + t) * 7.0);
  col += ember * bloom * 0.62 * flick * u_warm;

  float royalBloom = exp(-2.0 * length(p + vec2(0.46, 0.30)));
  col += violet * royalBloom * 0.30;

  // ---- drifting filament veins ----
  float v = veins(p * 1.1 + vec2(t * 0.5, -t * 0.3));
  col += mix(violet, ember, 0.55) * pow(v, 5.0) * 0.16;

  // ---- rising ember particles ----
  float glow = 0.0;
  for (int i = 0; i < 26; i++) {
    float fi = float(i);
    float h1 = hash(vec2(fi, 1.7));
    float h2 = hash(vec2(fi, 9.3));
    float speed = 0.05 + h2 * 0.09;
    float y = fract(h1 + u_time * speed * 0.09);
    float x = h2 * 2.2 - 1.1 + sin(u_time * 0.25 + fi) * 0.09 + u_mouse.x * 0.05;
    float depth = 0.35 + h1 * 0.9;
    float d = length((p - vec2(x, y * 2.0 - 1.0)) * vec2(1.0, 0.85));
    glow += (0.0022 / (d * d + 0.0016)) * depth;
  }
  col += mix(ember, gold, 0.6) * glow * (0.55 + 0.45 * u_warm);

  // ---- diurnal phase: cooler royal at night, warmer at day ----
  float dayWarm = smoothstep(0.18, 0.62, u_phase) * (1.0 - smoothstep(0.72, 0.98, u_phase));
  col = mix(col, col * vec3(1.14, 1.02, 0.92), dayWarm * 0.55);
  col = mix(col, col * vec3(0.86, 0.90, 1.18), smoothstep(0.80, 1.0, u_phase) * 0.5 + smoothstep(0.22, 0.0, u_phase) * 0.5);

  // ---- horizon shear ----
  float horizon = smoothstep(-0.2, 0.9, p.y + density * 0.3);
  col *= mix(1.06, 0.62, horizon);

  // ---- vignette + fine grain ----
  float vig = 1.0 - 0.72 * pow(length((uv - 0.5) * vec2(1.05, 1.25)), 2.1);
  col *= vig;
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.022;

  outColor = vec4(max(col, 0.0), 1.0);
}
`;

type Props = {
  className?: string;
  /** field = full-page atmosphere, core = tighter, hotter panel */
  variant?: "field" | "core";
  interactive?: boolean;
};

export default function EmberField({ className = "", variant = "field", interactive = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" })
      ?? canvas.getContext("webgl", { antialias: false, alpha: false });

    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    const isGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
    const glAny = gl as WebGL2RenderingContext;

    const compile = (type: number, src: string) => {
      const sh = glAny.createShader(type);
      if (!sh) return null;
      glAny.shaderSource(sh, src);
      glAny.compileShader(sh);
      if (!glAny.getShaderParameter(sh, glAny.COMPILE_STATUS)) {
        glAny.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vertSrc = isGL2 ? VERT : VERT.replace("#version 300 es\n", "").replace("in vec2", "attribute vec2");
    const fragSrc = isGL2
      ? FRAG
      : FRAG.replace("#version 300 es\n", "")
          .replace("out vec4 outColor;", "")
          .replace(/outColor/g, "gl_FragColor")
          .replace(/in vec2/g, "varying vec2");

    const vs = compile(glAny.VERTEX_SHADER, vertSrc);
    const fs = compile(glAny.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) {
      canvas.style.display = "none";
      return;
    }

    const program = glAny.createProgram();
    if (!program) return;
    glAny.attachShader(program, vs);
    glAny.attachShader(program, fs);
    glAny.linkProgram(program);
    if (!glAny.getProgramParameter(program, glAny.LINK_STATUS)) {
      canvas.style.display = "none";
      return;
    }
    glAny.useProgram(program);

    const buf = glAny.createBuffer();
    glAny.bindBuffer(glAny.ARRAY_BUFFER, buf);
    glAny.bufferData(glAny.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), glAny.STATIC_DRAW);

    const loc = glAny.getAttribLocation(program, "a_pos");
    glAny.enableVertexAttribArray(loc);
    glAny.vertexAttribPointer(loc, 2, glAny.FLOAT, false, 0, 0);

    const u = {
      res: glAny.getUniformLocation(program, "u_res"),
      time: glAny.getUniformLocation(program, "u_time"),
      mouse: glAny.getUniformLocation(program, "u_mouse"),
      scroll: glAny.getUniformLocation(program, "u_scroll"),
      phase: glAny.getUniformLocation(program, "u_phase"),
      warm: glAny.getUniformLocation(program, "u_warm"),
    };

    let raf = 0;
    let visible = true;
    let w = 1;
    let h = 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, variant === "core" ? 1.5 : 1.25);
      const scale = variant === "core" ? 0.7 : 1;
      w = Math.max(1, Math.floor(canvas.clientWidth * dpr * scale));
      h = Math.max(1, Math.floor(canvas.clientHeight * dpr * scale));
      canvas.width = w;
      canvas.height = h;
      glAny.viewport(0, 0, w, h);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    resize();

    const target = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let scrollN = 0;
    let scrollSmooth = 0;

    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollN = max > 0 ? window.scrollY / max : 0;
    };

    if (interactive && !reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    io.observe(canvas);

    const start = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;

      smooth.x += (target.x - smooth.x) * 0.045;
      smooth.y += (target.y - smooth.y) * 0.045;
      scrollSmooth += (scrollN - scrollSmooth) * 0.05;

      const hour = new Date().getHours() + new Date().getMinutes() / 60;
      const phase = hour / 24;

      glAny.uniform2f(u.res, w, h);
      glAny.uniform1f(u.time, reduced ? 12 : (now - start) / 1000);
      glAny.uniform2f(u.mouse, smooth.x, smooth.y);
      glAny.uniform1f(u.scroll, scrollSmooth);
      glAny.uniform1f(u.phase, phase);
      glAny.uniform1f(u.warm, variant === "core" ? 1.25 : 1);
      glAny.drawArrays(glAny.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      glAny.deleteProgram(program);
      glAny.deleteShader(vs);
      glAny.deleteShader(fs);
      glAny.deleteBuffer(buf);
    };
  }, [interactive, variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`h-full w-full ${className}`}
      style={{ display: "block" }}
    />
  );
}
