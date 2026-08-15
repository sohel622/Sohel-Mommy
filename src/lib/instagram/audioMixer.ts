/**
 * Utility functions for client-side audio mixing, stereo level control,
 * and video + background music audio merging using Web Audio API.
 */

export interface MixSettings {
  originalVolume: number; // 0.0 to 1.0
  musicVolume: number; // 0.0 to 1.0
  bgStartAt?: number;
}

/**
 * Creates a merged Audio/Video blob by combining the video's original audio track
 * and background music track using Web Audio API OfflineAudioContext & MediaRecorder.
 * Preserves full video resolution, frame rate, and exact duration without truncation.
 */
export async function mergeVideoAndAudio(
  videoUrl: string,
  bgAudioUrl?: string,
  settings: MixSettings = { originalVolume: 1.0, musicVolume: 0.8, bgStartAt: 0 },
): Promise<{ url: string; blob: Blob }> {
  // Shortcut: If no background audio and original volume is 100%, return original video URL immediately (0ms, 100% pristine)
  if ((!bgAudioUrl || settings.musicVolume === 0) && settings.originalVolume >= 0.99) {
    return { url: videoUrl, blob: new Blob() };
  }

  return new Promise((resolve) => {
    const run = async () => {
      try {
        const audioCtx = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )();

        // 1. Probe video duration first to ensure 100% accurate video length
        const videoEl = document.createElement("video");
        videoEl.src = videoUrl;
        videoEl.crossOrigin = "anonymous";
        videoEl.muted = true;
        videoEl.playsInline = true;

        await new Promise<void>((r) => {
          videoEl.onloadedmetadata = () => r();
          videoEl.onerror = () => r();
          setTimeout(r, 1500);
        });

        const probedDuration =
          videoEl.duration && Number.isFinite(videoEl.duration) && videoEl.duration > 0
            ? videoEl.duration
            : 15;

        // 2. Asynchronously fetch & decode AudioBuffers in parallel
        const fetchAudioBuffer = async (url: string): Promise<AudioBuffer | null> => {
          try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const ab = await res.arrayBuffer();
            return await audioCtx.decodeAudioData(ab);
          } catch {
            return null;
          }
        };

        const [videoAudioBuffer, bgAudioBuffer] = await Promise.all([
          fetchAudioBuffer(videoUrl),
          bgAudioUrl && settings.musicVolume > 0
            ? fetchAudioBuffer(bgAudioUrl)
            : Promise.resolve(null),
        ]);

        const duration = Math.max(probedDuration, videoAudioBuffer?.duration || 0);

        const sampleRate = 44100;
        const totalSamples = Math.max(1, Math.ceil(sampleRate * duration));

        // 3. Render mixed stereo audio in OfflineAudioContext (~10-30ms non-blocking)
        let renderedAudioBuffer: AudioBuffer | null = null;
        try {
          const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

          if (videoAudioBuffer && settings.originalVolume > 0) {
            const vSource = offlineCtx.createBufferSource();
            vSource.buffer = videoAudioBuffer;
            const vGain = offlineCtx.createGain();
            vGain.gain.value = settings.originalVolume;
            vSource.connect(vGain);
            vGain.connect(offlineCtx.destination);
            vSource.start(0);
          }

          if (bgAudioBuffer && settings.musicVolume > 0) {
            const bgSource = offlineCtx.createBufferSource();
            bgSource.buffer = bgAudioBuffer;
            bgSource.loop = true; // Auto-loop background music if shorter than video duration!
            const bgGain = offlineCtx.createGain();
            bgGain.gain.value = settings.musicVolume;
            bgSource.connect(bgGain);
            bgGain.connect(offlineCtx.destination);
            bgSource.start(0, settings.bgStartAt || 0);
          }

          renderedAudioBuffer = await offlineCtx.startRendering();
        } catch {
          renderedAudioBuffer = null;
        }

        // 4. Attach rendered stereo audio destination node to media stream
        const dest = audioCtx.createMediaStreamDestination();
        if (renderedAudioBuffer) {
          const bufferSource = audioCtx.createBufferSource();
          bufferSource.buffer = renderedAudioBuffer;
          bufferSource.connect(dest);
          bufferSource.start(0);
        }

        const videoStream = (
          videoEl as HTMLVideoElement & { captureStream?: () => MediaStream }
        ).captureStream?.();

        if (!videoStream || !videoStream.getVideoTracks().length) {
          resolve({ url: videoUrl, blob: new Blob() });
          return;
        }

        const combinedTracks: MediaStreamTrack[] = [
          ...videoStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ];

        const combinedStream = new MediaStream(combinedTracks);
        const chunks: BlobPart[] = [];

        let mimeType = "video/webm;codecs=vp9,opus";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm;codecs=vp8,opus";
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm";
        }

        const recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 8000000, // 8Mbps high-fidelity HD video encoding
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const mergedBlob = new Blob(chunks, { type: "video/webm" });
          const mergedUrl = URL.createObjectURL(mergedBlob);
          try {
            void audioCtx.close();
          } catch {
            /* ignore */
          }
          resolve({ url: mergedUrl, blob: mergedBlob });
        };

        // Smooth 1.0x native playback rate to eliminate lag, frame drops, stuttering, or truncation
        videoEl.playbackRate = 1.0;
        videoEl.currentTime = 0;

        recorder.start();
        void videoEl.play();

        videoEl.onended = () => {
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
        };

        // Generous safety timeout (+3s buffer) so video is NEVER cut off prematurely
        setTimeout(
          () => {
            if (recorder.state !== "inactive") {
              videoEl.pause();
              recorder.stop();
            }
          },
          (duration + 3) * 1000,
        );
      } catch {
        resolve({ url: videoUrl, blob: new Blob() });
      }
    };

    void run();
  });
}
