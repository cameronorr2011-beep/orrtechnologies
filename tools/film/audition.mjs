import { writeFileSync, mkdirSync } from "node:fs";
import { speak } from "./tts.mjs";
const line = "You make something good. The world should see it.";
const voices = ["aura-2-apollo-en","aura-2-orion-en","aura-2-odysseus-en","aura-2-atlas-en","aura-2-zeus-en","aura-2-andromeda-en","aura-2-helena-en"];
mkdirSync("studio-out/film2/voice", { recursive: true });
for (const v of voices) {
  try {
    const buf = await speak({ text: line, voice: v });
    writeFileSync(`studio-out/film2/voice/aud-${v}.mp3`, buf);
    console.log("ok", v, buf.length);
  } catch (e) { console.log("fail", v, e.message.slice(0,160)); }
}
