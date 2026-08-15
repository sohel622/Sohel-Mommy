import type { Reel, ReelInsights } from "./data";

/** Generates or retrieves realistic metrics for a given Reel. */
export function getReelInsights(reel: Reel): ReelInsights {
  if (reel.insights) return reel.insights;

  // Derive base seed from view string (e.g. "132K", "45.8K", or number)
  let rawViews = 132000;
  if (typeof reel.views === "string") {
    if (reel.views.endsWith("K")) {
      rawViews = Math.round(parseFloat(reel.views) * 1000);
    } else if (reel.views.endsWith("M")) {
      rawViews = Math.round(parseFloat(reel.views) * 1000000);
    } else if (!isNaN(Number(reel.views))) {
      rawViews = Number(reel.views);
    }
  }

  const duration = 18; // default 18s duration
  const initialPlays = Math.round(rawViews * 0.72);
  const replays = Math.round(rawViews * 0.28);
  const totalLoops = initialPlays + replays;
  const avgWatch = Math.min(duration, Number((duration * 0.84).toFixed(1)));
  const totalHours = Number(((totalLoops * avgWatch) / 3600).toFixed(1));

  // 10 points retention curve
  const retentionPoints = Array.from({ length: 10 }).map((_, i) => {
    const sec = Number(((duration / 9) * i).toFixed(1));
    // smooth curve from 100% down to ~72%, with slight bump around middle (replays)
    let pct = 100 - i * 3.2;
    if (i === 4 || i === 5) pct += 4; // replay loop bump
    if (i === 9) pct = 76.5;
    return { second: sec, percentage: Number(pct.toFixed(1)) };
  });

  return {
    loopCount: totalLoops,
    initialPlays,
    replays,
    completionRate: 82.4,
    avgWatchTime: avgWatch,
    totalDuration: duration,
    totalWatchTimeHours: totalHours,
    accountsReached: Math.round(rawViews * 0.88),
    nonFollowerRatio: 78.2,
    saves: Math.round(reel.likes * 0.18),
    shares: Math.round(reel.likes * 0.24),
    profileVisits: Math.round(reel.likes * 0.35),
    followsGained: Math.round(reel.likes * 0.08),
    retentionPoints,
    trafficSources: [
      { name: "Reels Tab", percentage: 68, color: "#ec4899" },
      { name: "Profile", percentage: 18, color: "#a855f7" },
      { name: "Explore", percentage: 9, color: "#3b82f6" },
      { name: "Direct Shares", percentage: 5, color: "#10b981" },
    ],
    topLocations: [
      { city: "San Francisco, USA", percentage: 28 },
      { city: "Tokyo, Japan", percentage: 22 },
      { city: "London, UK", percentage: 19 },
      { city: "Barcelona, Spain", percentage: 14 },
    ],
    genderSplit: { male: 44, female: 52, other: 4 },
  };
}

/** Increment live loops and watch time when a Reel repeats playing in the app. */
export function incrementLiveLoop(reel: Reel, watchedSeconds = 18): Reel {
  const current = getReelInsights(reel);
  const newLoops = current.loopCount + 1;
  const newReplays = current.replays + 1;
  const addedHours = watchedSeconds / 3600;
  const newHours = Number((current.totalWatchTimeHours + addedHours).toFixed(2));

  // Slightly shift completion rate towards high completion
  const newCompletion = Number(Math.min(99.9, current.completionRate + 0.05).toFixed(1));

  const updatedInsights: ReelInsights = {
    ...current,
    loopCount: newLoops,
    replays: newReplays,
    totalWatchTimeHours: newHours,
    completionRate: newCompletion,
  };

  const newViewCount = newLoops >= 1000 ? `${(newLoops / 1000).toFixed(1)}K` : String(newLoops);

  return {
    ...reel,
    views: newViewCount,
    insights: updatedInsights,
  };
}

/** Simulate real-time live creator traffic ticks. */
const CITIES = ["New York", "Tokyo", "London", "Paris", "Berlin", "Seoul", "Toronto", "Sydney"];
const ACTIONS = [
  "completed 100% video loop (+1 loop)",
  "replayed loop from 0s (+1 loop)",
  "shared Reel to Stories",
  "saved Reel to collection",
  "liked video",
  "visited creator profile",
];

export function generateLiveEvent(reel: Reel): { updatedReel: Reel; message: string } {
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const current = getReelInsights(reel);

  let updatedReel = reel;
  if (action.includes("loop")) {
    updatedReel = incrementLiveLoop(reel, current.totalDuration);
  } else if (action.includes("like")) {
    updatedReel = {
      ...reel,
      likes: reel.likes + 1,
      insights: {
        ...current,
        saves: action.includes("save") ? current.saves + 1 : current.saves,
      },
    };
  }

  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const message = `[${timestamp}] Viewer in ${city} ${action}`;

  return { updatedReel, message };
}
