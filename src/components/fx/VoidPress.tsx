"use client";

import { useEffect, useRef } from "react";

/**
 * The $100 Press.
 *
 * A real 3D scene — no three.js, no model files, no textures. One fragment
 * shader raymarches four machined browser plates settling onto a sheet of
 * paper; the paper takes a printed impression as they land. Scroll pulls the
 * camera back and turns the stack; the pointer tilts it.
 *
 * This replaces the abstract ink cloud as the hero's signature: the visitor
 * watches the thing they are buying get stamped.
 *
 * Cost: one fullscreen triangle, ~96 raymarch steps, DPR capped at 1.35, the
 * loop stops offscreen, and reduced motion renders the finished print once.
 */

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;

out vec4 outColor;

uniform vec2  uRes;
uniform float uTime;
uniform float uPress;
uniform float uScroll;
uniform vec2  uPointer;

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// Scene: id 1..4 = plates (bottom to top), id 9 = the paper sheet.
float map(vec3 p, out float id) {
  id = 9.0;

  // Turn the whole object rather than the camera, so the key light stays put.
  p.xz = rot(uPointer.x * 0.20 + uScroll * 0.55) * p.xz;

  float d = 1e5;

  // The paper: one thick sheet, slightly larger than the plates.
  float sheet = sdRoundBox(p - vec3(0.0, -0.60, 0.0), vec3(1.60, 0.026, 1.02), 0.028);
  if (sheet < d) { d = sheet; id = 9.0; }

  for (int i = 0; i < 4; i++) {
    float fi = float(i);

    // Plates settle in sequence: the top one lands last.
    float local = clamp((uPress - fi * 0.11) / 0.67, 0.0, 1.0);
    local = local * local * (3.0 - 2.0 * local);

    float gap = mix(0.44, 0.082, local);
    float y = -0.44 + fi * gap;

    vec3 q = p - vec3(0.0, y, 0.0);
    float spin = (fi - 1.5) * 0.045 * (1.0 - local) + sin(uTime * 0.22 + fi * 1.7) * 0.004;
    // The top plate lands a few degrees out of square, like a hand-set cover.
    if (i == 3) spin += 0.12 * local;
    q.xz = rot(spin) * q.xz;

    // A beveled browser plate.
    float plate = sdRoundBox(q, vec3(1.30, 0.048, 0.86), 0.042);

    // Chrome bar: a shallow groove across the front edge.
    float groove = sdRoundBox(q - vec3(0.0, 0.047, 0.77), vec3(1.23, 0.006, 0.010), 0.003);
    plate = max(plate, -groove);

    if (plate < d) { d = plate; id = fi + 1.0; }
  }

  return d;
}

vec3 calcNormal(vec3 p) {
  float id;
  vec2 e = vec2(0.0018, 0.0);
  return normalize(vec3(
    map(p + e.xyy, id) - map(p - e.xyy, id),
    map(p + e.yxy, id) - map(p - e.yxy, id),
    map(p + e.yyx, id) - map(p - e.yyx, id)
  ));
}

vec3 background(vec2 uv) {
  vec3 bg = mix(vec3(0.021, 0.021, 0.019), vec3(0.038, 0.041, 0.058), smoothstep(-0.7, 0.9, uv.y));
  bg += vec3(0.12, 0.20, 0.90) * 0.17 * exp(-length((uv - vec2(0.46, 0.30)) * vec2(0.9, 1.35)) * 2.7);
  bg += vec3(0.95, 0.24, 0.12) * 0.13 * exp(-length((uv - vec2(-0.52, -0.42)) * vec2(1.1, 1.0)) * 2.9);
  bg += vec3(0.10, 0.55, 0.40) * 0.05 * exp(-length((uv - vec2(0.1, -0.7)) * vec2(1.3, 1.0)) * 3.4);
  return bg;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = uPointer;

  // Camera: eye height, a slow pull-back as the hero leaves.
  vec3 ro = vec3(sin(m.x * 0.45) * 1.15, 1.02 - m.y * 0.16, 4.30 + uScroll * 0.55);
  vec3 ta = vec3(0.0, -0.10 + uScroll * 0.06, 0.0);
  vec3 fwd = normalize(ta - ro);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(uv.x * right + uv.y * up + fwd * 1.58);

  float t = 0.05;
  float hitId = 0.0;
  bool hit = false;
  float lastStep = 0.0;

  for (int i = 0; i < 96; i++) {
    vec3 p = ro + rd * t;
    float id;
    float d = map(p, id);
    lastStep = float(i);
    if (d < 0.0014) { hit = true; hitId = id; break; }
    t += d * 0.92;
    if (t > 11.0) break;
  }

  vec3 col = background(uv);

  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 rdN = normalize(rd);

    vec3 key = normalize(vec3(0.46, 0.95, 0.52));
    vec3 rim = normalize(vec3(-0.92, 0.30, -0.30));
    vec3 coral = normalize(vec3(0.75, -0.25, 0.55));

    vec3 base;
    float gloss;

    if (hitId > 8.5) {
      // Paper. The impression prints in as the press lands.
      base = vec3(0.955, 0.930, 0.872);
      // One electric registration bar, printed flush into the margin.
      float onSheet = step(abs(p.x), 1.24) * step(abs(p.z), 0.80);
      float bar = step(abs(p.z - 0.92), 0.016) * step(abs(p.x + 0.62), 0.30);
      base = mix(base, vec3(0.184, 0.294, 1.0), onSheet * uPress * bar);
      gloss = 0.10;
    } else {
      float depth = hitId - 1.0;
      base = mix(vec3(0.050, 0.050, 0.048), vec3(0.082, 0.086, 0.108), depth / 3.0);
      // The top plate carries the studio blue on its bevel.
      if (hitId > 3.5) base = mix(base, vec3(0.14, 0.21, 1.0), 0.22);
      gloss = 0.92;
    }

    float diff = clamp(dot(n, key), 0.0, 1.0);
    float spec = pow(clamp(dot(reflect(-key, n), -rdN), 0.0, 1.0), 52.0);
    float fres = pow(1.0 - clamp(dot(n, -rdN), 0.0, 1.0), 3.0);
    float fill = clamp(dot(n, coral), 0.0, 1.0);
    float rimm = clamp(dot(n, rim), 0.0, 1.0);

    col = base * (0.13 + 0.95 * diff);
    // Satin, not glass: one broad warm highlight on the bevels and a
    // restrained electric edge, no coloured fill light.
    col += vec3(1.0, 0.82, 0.62) * spec * gloss * 0.95;
    col += vec3(0.22, 0.34, 1.0) * fres * 0.24;
    col += vec3(0.35, 0.45, 1.0) * pow(rimm, 2.0) * 0.06;
    col += base * fill * 0.06;

    // Cheap contact shading: the deeper the march, the more it sits in.
    float ao = clamp(1.0 - lastStep * 0.010, 0.52, 1.0);
    col *= ao;

    // Warm haze between the plates.
    col = mix(col, background(uv), smoothstep(3.2, 9.0, t) * 0.85);
  }

  // Ink grain, fixed to the screen.
  float g = fract(sin(dot(gl_FragCoord.xy + fract(uTime) * 91.0, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.030;

  // Cinematic falloff, a touch stronger at the edges the type sits on.
  float vign = smoothstep(1.45, 0.20, length(uv * vec2(0.86, 1.0)));
  col *= mix(0.34, 1.0, vign);

  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[VoidPress]", gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function VoidPress({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      canvas.dataset.fallback = "true";
      canvas.dataset.vp = "no-gl";
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      canvas.dataset.fallback = "true";
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.dataset.fallback = "true";
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPress = gl.getUniformLocation(program, "uPress");
    const uScroll = gl.getUniformLocation(program, "uScroll");
    const uPointer = gl.getUniformLocation(program, "uPointer");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
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
    let running = true;
    let raf = 0;
    const start = performance.now();

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

    const draw = (now: number) => {
      if (!running) return;

      pointerX += (targetX - pointerX) * 0.05;
      pointerY += (targetY - pointerY) * 0.05;
      scroll += (targetScroll - scroll) * 0.07;

      // The offer never waits on the animation: 150ms of rest, then a
      // 800ms stamp that is finished before anyone starts reading.
      const raw = reduced ? 1 : Math.min(1, Math.max(0, (now - start - 150) / 800));
      const press = reduced ? 1 : 1 - Math.pow(1 - raw, 3);

      resize();
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uPress, press);
      gl.uniform1f(uScroll, scroll);
      gl.uniform2f(uPointer, reduced ? 0 : pointerX, reduced ? 0 : pointerY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    onScroll();
    raf = requestAnimationFrame(draw);
    canvas.dataset.vp = "running";

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
      { rootMargin: "160px" },
    );
    observer.observe(canvas);

    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

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
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="press-fallback absolute inset-0" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
