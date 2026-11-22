import { execFileSync } from "node:child_process";
function decode(p){const r=execFileSync("ffmpeg",["-v","error","-i",p,"-f","f32le","-ac","1","-ar","48000","-"],{maxBuffer:1<<30});return new Float32Array(r.buffer,r.byteOffset,Math.floor(r.length/4));}
const voice=decode("studio-out/film2/stem-voice.wav");
const music=decode("studio-out/film2/stem-music.wav");
const SR=48000;
function rms(x,a,b){let s=0,n=0;for(let i=Math.floor(a*SR);i<Math.floor(b*SR);i++){s+=x[i]*x[i];n++;}return 20*Math.log10(Math.sqrt(s/n)||1e-9);}
const windows=[["line03",6.35,8.1],["line06",15.1,17.7],["music only A",2.1,3.0],["music only B",13.0,14.0],["end card",20.8,23.2]];
for(const [label,a,b] of windows){
  const v=rms(voice,a,b), m=rms(music,a,b);
  console.log(`${label.padEnd(13)} voice ${v.toFixed(1)}  music ${m.toFixed(1)}  gap ${(v-m).toFixed(1)} dB`);
}
