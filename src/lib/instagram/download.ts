/**
 * Downloads media with an Instagram-style animated "Tweetgram • @username"
 * watermark that drifts between the corners of the frame.
 *
 * The video is re-encoded through a canvas + MediaRecorder pipeline whose
 * stream explicitly merges the ORIGINAL AUDIO TRACK, so exported clips keep
 * their music/sound. When the browser (or the media source) doesn't allow
 * capture, it falls back to a plain download of the original file.
 */
export async function downloadWithWatermark(
  mediaUrl: string,
  mediaType: "image" | "video",
  onProgress?: (msg: string) => void,
  username = "tweetgram",
): Promise<void> {
  if (mediaType === "image") {
    await plainDownload(mediaUrl, "tweetgram-image");
    return;
  }

  let cleanup: (() => void) | null = null;

  try {
    onProgress?.("Preparing download…");
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = mediaUrl;
    video.playsInline = true;
    // NOTE: not muted — the element must decode audio so it can be captured.
    video.volume = 1;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("load failed"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx || typeof MediaRecorder === "undefined") throw new Error("unsupported");

    const canvasStream = canvas.captureStream(30);

    // ---- Audio: route the element's audio into the recorded stream ----
    const mixed = new MediaStream(canvasStream.getVideoTracks());
    try {
      const AudioCtor: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtor();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      // Keep it silent for the user while still decoding audio for capture.
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      source.connect(gain).connect(audioCtx.destination);
      dest.stream.getAudioTracks().forEach((t) => mixed.addTrack(t));
      cleanup = () => void audioCtx.close().catch(() => undefined);
    } catch {
      // Cross-origin media can't be captured — export video only.
    }

    const recorder = new MediaRecorder(mixed, {
      mimeType: pickMime(),
      videoBitsPerSecond: 6_000_000,
      audioBitsPerSecond: 128_000,
    });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const done = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    });

    const label = `Tweetgram • @${username}`;
    const fontSize = Math.max(20, Math.round(canvas.width * 0.045));
    const pad = Math.round(fontSize * 1.1);

    // Corner cycle: bottom-right -> top-left -> bottom-left -> top-right
    const corners: Array<[number, number]> = [
      [1, 1],
      [0, 0],
      [0, 1],
      [1, 0],
    ];
    const start = performance.now();
    const CYCLE = 4000; // ms per corner

    const draw = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
      const width = ctx.measureText(label).width;

      const t = performance.now() - start;
      const i = Math.floor(t / CYCLE) % corners.length;
      const [cx, cy] = corners[i];
      const x = cx === 0 ? pad : canvas.width - width - pad;
      const y = cy === 0 ? pad + fontSize : canvas.height - pad;

      // Soft bobbing motion inside the corner.
      const bob = Math.sin(t / 700) * fontSize * 0.25;

      ctx.globalAlpha = 0.9;
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = fontSize * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(label, x, y + bob);
      ctx.restore();

      if (!video.paused && !video.ended) requestAnimationFrame(draw);
    };

    onProgress?.("Rendering watermark…");
    recorder.start();
    await video.play();
    draw();
    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });

    // ---- 4-second Tweetgram branded outro appended to the export ----
    onProgress?.("Adding Tweetgram outro…");
    await renderOutro(ctx, canvas, 4000);

    recorder.stop();
    const blob = await done;
    triggerBlobDownload(blob, "tweetgram-video.webm");
    onProgress?.("Download ready");
  } catch {
    await plainDownload(mediaUrl, "tweetgram-video");
    onProgress?.("Download started");
  } finally {
    cleanup?.();
  }
}

function pickMime() {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "video/webm";
}

async function plainDownload(url: string, name: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    triggerBlobDownload(blob, name);
  } catch {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.click();
  }
}

function triggerBlobDownload(blob: Blob, name: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 4000);
}

/**
 * Draws a 4-second animated Tweetgram branding outro straight onto the
 * recording canvas so the exported file ends with the TG logo animation.
 */
function renderOutro(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  duration: number,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    const step = () => {
      const t = performance.now() - start;
      const p = Math.min(1, t / duration);

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // Spring-in scale then a gentle breathe.
      const intro = Math.min(1, t / 700);
      const ease = 1 - Math.pow(1 - intro, 3);
      const scale = 0.6 + ease * 0.4 + Math.sin(t / 500) * 0.015;
      const size = Math.min(w, h) * 0.34 * scale;

      ctx.save();
      ctx.translate(cx, cy - h * 0.04);

      const grad = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
      grad.addColorStop(0, "#FF0055");
      grad.addColorStop(0.5, "#FF007F");
      grad.addColorStop(1, "#FFC53D");

      const r = size * 0.24;
      ctx.beginPath();
      ctx.moveTo(-size / 2 + r, -size / 2);
      ctx.arcTo(size / 2, -size / 2, size / 2, size / 2, r);
      ctx.arcTo(size / 2, size / 2, -size / 2, size / 2, r);
      ctx.arcTo(-size / 2, size / 2, -size / 2, -size / 2, r);
      ctx.arcTo(-size / 2, -size / 2, size / 2, -size / 2, r);
      ctx.closePath();
      ctx.shadowColor = "rgba(255,0,85,0.55)";
      ctx.shadowBlur = size * 0.3;
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0b0b0b";
      ctx.font = `800 ${Math.round(size * 0.42)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TG", 0, size * 0.02);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, (t - 500) / 600));
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = `700 ${Math.round(Math.min(w, h) * 0.07)}px system-ui, sans-serif`;
      ctx.fillText("Tweetgram", cx, cy + h * 0.16);
      ctx.globalAlpha *= 0.7;
      ctx.font = `500 ${Math.round(Math.min(w, h) * 0.038)}px system-ui, sans-serif`;
      ctx.fillText("Share your world", cx, cy + h * 0.22);
      ctx.restore();

      // Fade to black at the very end.
      if (p > 0.85) {
        ctx.fillStyle = `rgba(0,0,0,${(p - 0.85) / 0.15})`;
        ctx.fillRect(0, 0, w, h);
      }

      if (p < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}
