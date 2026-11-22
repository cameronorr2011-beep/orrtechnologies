import { execFileSync } from "node:child_process";
const [file] = process.argv.slice(2);
const raw = execFileSync("ffmpeg", ["-v","error","-i",file,"-f","f32le","-ac","2","-ar","48000","-"], { maxBuffer: 1<<30 });
const x = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.length/4));
const SR = 48000, secs = Math.floor(x.length/2/SR);
for (let s = 0; s < secs; s++) {
  let sum = 0, peak = 0, n = 0;
  for (let i = s*SR; i < (s+1)*SR; i++) {
    const v = (x[i*2] + x[i*2+1]) * 0.5;
    sum += v*v; if (Math.abs(v) > peak) peak = Math.abs(v); n++;
  }
  const rms = Math.sqrt(sum/n);
  console.log(`${String(s).padStart(2)}s  rms ${(20*Math.log10(rms||1e-9)).toFixed(1)} dBFS  peak ${(20*Math.log10(peak||1e-9)).toFixed(1)}`);
}
