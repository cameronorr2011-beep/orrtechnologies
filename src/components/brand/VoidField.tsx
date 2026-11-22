"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  /** 1 = full strength. Lower values are used for quieter placements. */
  intensity?: number;
  /** zoom: bigger number = black hole fills more of the frame */
  scale?: number;
  /** accessibility label for the artwork */
  label?: string;
};

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_scale;
uniform float u_intensity;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  uv *= u_scale;

  float R = 0.30;
  float r = length(uv);

  // deep space: near-black with a breath of cold light
  vec3 col = vec3(0.008, 0.009, 0.010);
  col += vec3(0.018, 0.021, 0.025) * smoothstep(1.15, 0.0, r);

  // sparse stars, slowly twinkling
  vec2 sp = uv * 8.0;
  vec2 cell = floor(sp);
  vec2 fp = fract(sp) - 0.5;
  float h = hash21(cell);
  if (h > 0.955) {
    float d = length(fp);
    float tw = 0.55 + 0.45 * sin(u_time * 0.9 + h * 61.0);
    col += vec3(0.92, 0.94, 0.97) * smoothstep(0.045, 0.0, d) * tw * (0.35 + 0.65 * h);
  }
  col += vec3(0.42, 0.47, 0.5) * 0.015 * fbm(uv * 9.0);

  // accretion disk: its own tilted plane
  vec2 d = rot(0.42) * uv;
  vec2 dp = vec2(d.x, d.y * 3.2);
  float dr = length(dp);
  float ang = atan(dp.y, dp.x);
  vec2 dir = dp / max(dr, 0.0001);
  float spin = u_time * 0.035;

  float streaks = fbm(vec2((dir.x * 0.55 + dir.y) * 5.0 + spin * 2.0, dr * 26.0 - u_time * 0.07));
  float broad = fbm(vec2(dr * 7.0, sin(ang + spin) * 1.6));

  float ringMask = smoothstep(0.44, 0.505, dr) * smoothstep(0.90, 0.68, dr);
  float disk = ringMask * (0.16 + 0.80 * streaks) * (0.55 + 0.55 * broad);
  disk *= 1.0 + 1.15 * exp(-pow((dr - 0.515) / 0.05, 2.0));

  // doppler beaming: the approaching side is hotter
  disk *= 0.38 + 1.55 * smoothstep(0.42, -0.5, d.x);

  // the disk's light is bent around the horizon, so it clears the sphere
  disk *= smoothstep(R * 0.99, R * 1.045, r);

  // photon ring
  float pr = R * 1.045;
  float photon = exp(-pow((r - pr) / 0.0032, 2.0));
  float halo = exp(-pow((r - pr) / 0.062, 2.0)) * 0.32;

  // a thin lensed arc of the far side, arched over the top
  float arc = exp(-pow((r - R * 1.115) / 0.006, 2.0)) * smoothstep(0.55, 0.05, abs(uv.x)) * 0.55;

  vec3 hot = vec3(1.0, 0.986, 0.938);
  vec3 lime = vec3(0.706, 0.898, 0.318);
  vec3 diskCol = mix(lime, hot, smoothstep(0.52, 0.84, dr));
  diskCol = mix(diskCol, vec3(0.78, 0.80, 0.82), smoothstep(0.74, 0.96, dr) * 0.7);

  col += diskCol * disk * 0.78;
  col += lime * arc * 0.30;
  col += hot * photon * 2.0;
  col += hot * halo * 0.9;
  col += vec3(0.05, 0.058, 0.045) * smoothstep(R * 1.2, R * 2.6, r) * smoothstep(R * 0.9, R * 1.02, r);

  // event horizon: absolute black, with a soft limb
  col *= smoothstep(R * 0.985, R * 1.008, r);

  // fine dither so the dark gradients never band
  float g = hash21(gl_FragCoord.xy + fract(u_time) * 100.0);
  col += (g - 0.5) * 0.022;

  gl_FragColor = vec4(col * u_intensity, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/**
 * Real-time black-hole plate. One shader, reused at every scale.
 * Pauses when offscreen or the tab is hidden; renders one static frame
 * when the visitor prefers reduced motion.
 */
export default function VoidField({
  className = "",
  intensity = 1,
  scale = 2.15,
  label = "A black hole rendered in real time",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      canvas.style.display = "none";
      return;
    }


    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uScale = gl.getUniformLocation(program, "u_scale");
    const uIntensity = gl.getUniformLocation(program, "u_intensity");

    gl.uniform1f(uScale, scale);
    gl.uniform1f(uIntensity, intensity);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let inView = true;
    let last = 0;

    const resize = () => {
      if (!gl) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      draw(0);
    };

    const draw = (t: number) => {
      if (!gl) return;
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      if (!running) return;
      const t = (now - start) / 1000;
      if (now - last > 26) {
        draw(t);
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };

    const start = performance.now();

    const play = () => {
      if (running || reduce || !inView || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    draw(0);
    window.addEventListener("resize", resize);

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) play();
        else pause();
      },
      { threshold: 0.02 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    play();

    return () => {
      pause();
      io.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      gl?.deleteProgram(program);
      gl?.deleteShader(vs);
      gl?.deleteShader(fs);
      gl?.deleteBuffer(buffer);
    };
  }, [intensity, scale]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={label}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
