import { useEffect, useState } from "react";
import {
  BarChart2,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Eye,
  Users,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  UserPlus,
  Sparkles,
  Zap,
  TrendingUp,
  MapPin,
  PieChart,
  Copy,
  ChevronDown,
  Flame,
} from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { formatCount, type Reel } from "@/lib/instagram/data";
import { generateLiveEvent, getReelInsights } from "@/lib/instagram/insights";
import { getSafeVideoSrc } from "@/lib/instagram/media";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

export function ReelsInsightsModal() {
  const { insightsModal, closeInsights, reels, user, showToast } = useApp();
  useBodyScrollLock(insightsModal.open);
  const [selectedReelId, setSelectedReelId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "retention" | "audience">("overview");
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [pulseCount, setPulseCount] = useState(false);

  // Sync selected reel when modal opens
  useEffect(() => {
    if (!insightsModal.open) {
      setIsSimulating(false);
      return;
    }

    if (insightsModal.reelId) {
      setSelectedReelId(insightsModal.reelId);
    } else {
      // Default to user's first reel or any available reel
      const myReel = reels.find((r) => r.isCurrentUser || r.username === user.username);
      setSelectedReelId(myReel ? myReel.id : (reels[0]?.id ?? null));
    }
  }, [insightsModal.open, insightsModal.reelId, reels, user.username]);

  // Current active reel
  const currentReel = reels.find((r) => r.id === selectedReelId) ?? reels[0];

  // Simulation timer
  useEffect(() => {
    if (!isSimulating || !currentReel) return;

    const interval = setInterval(() => {
      const { updatedReel, message } = generateLiveEvent(currentReel);

      // Update reel state in context
      const index = reels.findIndex((r) => r.id === updatedReel.id);
      if (index !== -1) {
        reels[index] = updatedReel;
      }

      // Add to live log
      setLiveLog((prev) => [message, ...prev.slice(0, 11)]);

      // Flash pulse
      setPulseCount(true);
      setTimeout(() => setPulseCount(false), 400);
    }, 2200);

    return () => clearInterval(interval);
  }, [isSimulating, currentReel, reels]);

  if (!insightsModal.open || !currentReel) return null;

  const insights = getReelInsights(currentReel);
  const myReels = reels.filter((r) => r.isCurrentUser || r.username === user.username);
  const displayReelsList = myReels.length > 0 ? myReels : reels;

  const copyReport = () => {
    const text = `📊 REELS INSIGHTS REPORT - ${currentReel.caption.slice(0, 30)}
----------------------------------
🔄 Total Loops: ${formatCount(insights.loopCount)}
✅ Completion Rate: ${insights.completionRate}%
⏱️ Avg Watch Time: ${insights.avgWatchTime}s / ${insights.totalDuration}s
⏳ Total Watch Time: ${insights.totalWatchTimeHours} hrs
👥 Accounts Reached: ${formatCount(insights.accountsReached)} (${insights.nonFollowerRatio}% non-followers)
❤️ Likes: ${formatCount(currentReel.likes)} | 💬 Comments: ${formatCount(currentReel.commentsCount)}
🔖 Saves: ${formatCount(insights.saves)} | ↗️ Shares: ${formatCount(insights.shares)}`;

    void navigator.clipboard.writeText(text);
    showToast("Insights report copied to clipboard!");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 touch-none overscroll-none animate-fade-in"
      onClick={closeInsights}
    >
      <div
        data-modal-scrollable="true"
        className="relative w-full max-w-2xl bg-[#18181b] text-white border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Reels Insights</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Real-Time
                </span>
              </div>
              <p className="text-xs text-zinc-400">Creator Performance & Audience Retention</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
              title="Copy Summary Report"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Report</span>
            </button>
            <button
              onClick={closeInsights}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Published Reel Switcher Header */}
          <div className="bg-zinc-900/80 rounded-2xl p-3 border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                <video
                  src={getSafeVideoSrc(currentReel.mediaUrl)}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-pink-400 font-semibold mb-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>@{currentReel.username}</span>
                  {currentReel.isCurrentUser && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-pink-500/20 text-pink-300 rounded-md font-bold">
                      Your Reel
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-zinc-100 truncate max-w-[240px]">
                  {currentReel.caption || "Untitled Reel"}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">{currentReel.audioTrack}</p>
              </div>
            </div>

            {/* Reel Picker Dropdown */}
            <div className="relative w-full sm:w-auto shrink-0">
              <select
                value={currentReel.id}
                onChange={(e) => setSelectedReelId(Number(e.target.value))}
                className="w-full sm:w-auto appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                {displayReelsList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.caption.slice(0, 22) || `Reel #${r.id}`} (
                    {formatCount(getReelInsights(r).loopCount)} loops)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-800/80 gap-6 text-xs font-semibold text-zinc-400">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2.5 relative transition ${
                activeTab === "overview" ? "text-pink-500 font-bold" : "hover:text-zinc-200"
              }`}
            >
              Overview & Loops
              {activeTab === "overview" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("retention")}
              className={`pb-2.5 relative transition ${
                activeTab === "retention" ? "text-pink-500 font-bold" : "hover:text-zinc-200"
              }`}
            >
              Retention Curve
              {activeTab === "retention" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("audience")}
              className={`pb-2.5 relative transition ${
                activeTab === "audience" ? "text-pink-500 font-bold" : "hover:text-zinc-200"
              }`}
            >
              Traffic & Demographics
              {activeTab === "audience" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
              )}
            </button>
          </div>

          {/* TAB 1: OVERVIEW & REAL-TIME LOOPS */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              {/* Primary Real-Time Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Loop Count Card */}
                <div
                  className={`p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 transition-all ${
                    pulseCount ? "border-pink-500/80 bg-pink-950/20 scale-[1.02]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-pink-500" /> Loop Count
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formatCount(insights.loopCount)}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
                    <span>{formatCount(insights.initialPlays)} plays</span>
                    <span className="text-pink-400 font-semibold">
                      {formatCount(insights.replays)} replays
                    </span>
                  </p>
                </div>

                {/* Completion Rate Card */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90">
                  <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completion Rate
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                    {insights.completionRate}%
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${insights.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Average Watch Time Card */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90">
                  <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> Avg Watch Time
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {insights.avgWatchTime}s
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    of {insights.totalDuration}s duration (
                    {Math.round((insights.avgWatchTime / insights.totalDuration) * 100)}%)
                  </p>
                </div>

                {/* Total Watch Time Card */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90">
                  <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" /> Total Watch Time
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                    {insights.totalWatchTimeHours} hrs
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Cumulative viewer time</p>
                </div>
              </div>

              {/* Engagement & Conversion Breakdown */}
              <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/80 space-y-3">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Engagement & Reach Breakdown</span>
                  <span className="text-pink-400 font-semibold text-[11px]">
                    {formatCount(insights.accountsReached)} Accounts Reached
                  </span>
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 text-center">
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">
                      {formatCount(currentReel.likes)}
                    </div>
                    <div className="text-[10px] text-zinc-400">Likes</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <MessageCircle className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">
                      {formatCount(currentReel.commentsCount)}
                    </div>
                    <div className="text-[10px] text-zinc-400">Comments</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <Share2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">
                      {formatCount(insights.shares)}
                    </div>
                    <div className="text-[10px] text-zinc-400">Shares</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <Bookmark className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">
                      {formatCount(insights.saves)}
                    </div>
                    <div className="text-[10px] text-zinc-400">Saves</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <Eye className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">
                      {formatCount(insights.profileVisits)}
                    </div>
                    <div className="text-[10px] text-zinc-400">Profile Visits</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <UserPlus className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">
                      +{formatCount(insights.followsGained)}
                    </div>
                    <div className="text-[10px] text-zinc-400">Follows Gained</div>
                  </div>
                </div>
              </div>

              {/* Real-time Simulator Control Bar & Stream Ticker */}
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-pink-950/30 rounded-2xl p-4 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white">Real-Time Traffic Simulator</h4>
                  </div>
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                      isSimulating
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
                    }`}
                  >
                    {isSimulating ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        Simulating Live Traffic...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Start Live Traffic Simulator
                      </>
                    )}
                  </button>
                </div>

                {/* Terminal Stream Ticker */}
                <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800/80 font-mono text-[11px] space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
                  {liveLog.length === 0 ? (
                    <p className="text-zinc-500 italic">
                      Click &quot;Start Live Traffic Simulator&quot; to test real-time viewer loops
                      and engagement events.
                    </p>
                  ) : (
                    liveLog.map((log, i) => (
                      <div
                        key={i}
                        className="text-emerald-400/90 leading-tight flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{log}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIENCE RETENTION CURVE */}
          {activeTab === "retention" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-200">Audience Retention Graph</h3>
                    <p className="text-[11px] text-zinc-400">
                      Percentage of viewers watching at each second of the Reel
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-pink-400">
                      Hook Retention (0-3s): 92.4%
                    </span>
                  </div>
                </div>

                {/* Interactive Retention SVG Chart */}
                <div className="relative w-full h-44 pt-4 pb-2 bg-zinc-950/80 rounded-xl border border-zinc-800 px-2 flex flex-col justify-end">
                  {/* Grid lines */}
                  <div className="absolute inset-x-3 top-3 border-b border-zinc-800/50 text-[9px] text-zinc-600 pl-1">
                    100%
                  </div>
                  <div className="absolute inset-x-3 top-1/2 border-b border-zinc-800/50 text-[9px] text-zinc-600 pl-1">
                    50%
                  </div>

                  {/* SVG Line / Area Graph */}
                  <svg
                    className="w-full h-28 overflow-visible"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={
                        `M 0,${100 - insights.retentionPoints[0].percentage} ` +
                        insights.retentionPoints
                          .map((p, idx) => {
                            const x = (idx / (insights.retentionPoints.length - 1)) * 100;
                            const y = 100 - p.percentage;
                            return `L ${x},${y}`;
                          })
                          .join(" ") +
                        ` L 100,100 L 0,100 Z`
                      }
                      fill="url(#retentionGrad)"
                    />
                    <path
                      d={
                        `M 0,${100 - insights.retentionPoints[0].percentage} ` +
                        insights.retentionPoints
                          .map((p, idx) => {
                            const x = (idx / (insights.retentionPoints.length - 1)) * 100;
                            const y = 100 - p.percentage;
                            return `L ${x},${y}`;
                          })
                          .join(" ")
                      }
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="2.5"
                    />
                  </svg>

                  {/* Seconds axis */}
                  <div className="flex justify-between text-[10px] text-zinc-500 pt-2 px-1 border-t border-zinc-800/80">
                    <span>0s (Start)</span>
                    <span>4.5s</span>
                    <span>9s (Midpoint)</span>
                    <span>13.5s</span>
                    <span>{insights.totalDuration}s (End)</span>
                  </div>
                </div>

                {/* Key Insights Callouts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-2.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Strong Hook Retention</h4>
                      <p className="text-[11px] text-zinc-400">
                        92.4% of viewers stayed past the first 3 seconds — well above average for
                        this category!
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-2.5">
                    <RotateCcw className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Replay Loop Spike</h4>
                      <p className="text-[11px] text-zinc-400">
                        Viewers replayed second 8.0s - 12.0s repeatedly to catch details in your
                        clip.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRAFFIC & DEMOGRAPHICS */}
          {activeTab === "audience" && (
            <div className="space-y-4 animate-fade-in">
              {/* Traffic Sources */}
              <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-pink-400" /> Traffic Sources
                </h3>

                {/* Horizontal Stack Bar */}
                <div className="w-full h-3 rounded-full bg-zinc-950 flex overflow-hidden">
                  {insights.trafficSources.map((t, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${t.percentage}%`, backgroundColor: t.color }}
                      className="h-full transition-all duration-500"
                      title={`${t.name}: ${t.percentage}%`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {insights.trafficSources.map((t, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.color }}
                        />
                        <span>{t.name}</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">{t.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Locations & Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Top Locations */}
                <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" /> Top Audience Cities
                  </h3>
                  <div className="space-y-2">
                    {insights.topLocations.map((loc, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-300">
                          <span>{loc.city}</span>
                          <span className="font-semibold">{loc.percentage}%</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${loc.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender & Non-Followers Ratio */}
                <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" /> Audience Profile
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-300 mb-1">
                        <span>Non-Followers vs Followers Reach</span>
                        <span className="font-bold text-emerald-400">
                          {insights.nonFollowerRatio}% Non-Followers
                        </span>
                      </div>
                      <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-400 h-full"
                          style={{ width: `${insights.nonFollowerRatio}%` }}
                        />
                        <div
                          className="bg-zinc-700 h-full"
                          style={{ width: `${100 - insights.nonFollowerRatio}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800">
                      <div className="text-xs text-zinc-400 mb-2">Gender Breakdown</div>
                      <div className="flex justify-between gap-2 text-center text-xs">
                        <div className="flex-1 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          <div className="text-zinc-400 text-[10px]">Women</div>
                          <div className="font-bold text-pink-400">
                            {insights.genderSplit.female}%
                          </div>
                        </div>
                        <div className="flex-1 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          <div className="text-zinc-400 text-[10px]">Men</div>
                          <div className="font-bold text-blue-400">
                            {insights.genderSplit.male}%
                          </div>
                        </div>
                        <div className="flex-1 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          <div className="text-zinc-400 text-[10px]">Other</div>
                          <div className="font-bold text-amber-400">
                            {insights.genderSplit.other}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>Real-Time Reels Insights Engine • Updated Live</span>
          <button
            onClick={closeInsights}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
