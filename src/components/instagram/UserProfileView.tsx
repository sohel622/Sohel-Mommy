import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Share2,
  MoreHorizontal,
  Star,
  ChevronRight,
  Heart,
  MessageSquare,
  Info,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Check,
  UserPlus,
  UserCheck,
  Film,
  Link,
  ShieldAlert,
  Ban,
  X,
} from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { DEFAULT_BANNER, formatCount, type Post } from "@/lib/instagram/data";
import { getSafeVideoSrc } from "@/lib/instagram/media";
import { useAutoHideOnScroll } from "@/lib/instagram/useAutoHideOnScroll";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";
import { FeedPost } from "./FeedPost";

type CategoryTab = "posts" | "about";
type FilterChip = "All" | "Feels" | "Food" | "Essentials" | "Blood";

export function UserProfileView() {
  const {
    viewedUser,
    user,
    setView,
    posts,
    reels,
    isFollowing,
    toggleFollow,
    showToast,
    openLightbox,
    toggleLikePost,
    toggleLikeReel,
    openComments,
    openShare,
    openReel,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<CategoryTab>("posts");
  const [activeChip, setActiveChip] = useState<FilterChip>("All");
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  useBodyScrollLock(actionMenuOpen);

  const scrollContainerRef = useRef<HTMLElement>(null);
  const { isTabsHidden } = useAutoHideOnScroll(scrollContainerRef);

  const isOwnProfile =
    Boolean(viewedUser) &&
    Boolean(user?.username) &&
    viewedUser.toLowerCase() === user.username.toLowerCase();

  const following = isFollowing(viewedUser);

  const theirPosts = posts.filter((p) => p.username === viewedUser);
  const theirPhotoPosts = theirPosts.filter((p) => p.mediaType === "image" && Boolean(p.mediaUrl));
  const theirReels = reels.filter((r) => r.username === viewedUser);
  const avatar =
    theirPosts[0]?.userAvatar ??
    theirReels[0]?.userAvatar ??
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";

  // Combine Photos & Reels into Unified Feed
  const unifiedFeed = useMemo<Post[]>(() => {
    const seenIds = new Set<number>();
    const seenUrls = new Set<string>();
    const list: Post[] = [];

    for (const p of theirPosts) {
      if (!seenIds.has(p.id) && !seenUrls.has(p.mediaUrl)) {
        seenIds.add(p.id);
        seenUrls.add(p.mediaUrl);
        list.push({
          ...p,
          userAvatar: p.userAvatar || avatar,
          fullName: viewedUser,
          caption: p.caption || "living my best life ✨ #hopenity #vairal #aesthetic",
          timeAgo: p.timeAgo || "4 days ago",
          likesCount: p.likesCount ?? (p as unknown as { likes?: number }).likes ?? 68,
          commentsCount: p.commentsCount ?? p.comments?.length ?? 24,
          isLiked: p.isLiked,
        });
      }
    }

    for (const r of theirReels) {
      if (!seenIds.has(r.id) && !seenUrls.has(r.mediaUrl)) {
        seenIds.add(r.id);
        seenUrls.add(r.mediaUrl);
        list.push({
          id: r.id,
          userId: r.userId || "user_other",
          username: r.username,
          userAvatar: r.userAvatar || avatar,
          fullName: viewedUser,
          mediaUrl: r.mediaUrl,
          mediaType: "video" as const,
          caption: r.caption || "Creator Reel Spotlight ✨ #vairal #feels",
          timeAgo: "2 days ago",
          likesCount: r.likes || 124,
          commentsCount: r.commentsCount || 18,
          isLiked: r.isLiked,
        });
      }
    }

    return list;
  }, [theirPosts, theirReels, avatar, viewedUser]);

  if (!viewedUser) return null;

  // Apply Filter Chips
  const filteredFeed = unifiedFeed.filter((item) => {
    if (activeChip === "All") return true;
    if (activeChip === "Feels")
      return item.mediaType === "video" || item.caption.toLowerCase().includes("feel");
    if (activeChip === "Food") return item.caption.toLowerCase().includes("food");
    if (activeChip === "Essentials")
      return item.caption.toLowerCase().includes("essential") || item.mediaType === "image";
    if (activeChip === "Blood")
      return item.caption.toLowerCase().includes("blood") || item.mediaType === "image";
    return true;
  });

  return (
    <section
      id="user-profile-view"
      ref={scrollContainerRef}
      className="w-full max-w-[935px] mx-auto pb-28 relative h-[calc(100dvh-6rem)] md:h-[calc(100dvh-3rem)] overflow-y-auto overscroll-y-contain will-change-transform text-slate-100 touch-pan-y scroll-smooth"
      style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
    >
      {/* 1. TOP COVER BANNER & HEADER NAVIGATION */}
      <div
        className="relative w-full h-[210px] sm:h-[260px] bg-slate-900 rounded-b-3xl overflow-hidden shadow-2xl touch-pan-y"
        style={{ touchAction: "pan-y" }}
      >
        {/* Cover Photo Background */}
        <img
          src={DEFAULT_BANNER}
          alt={`${viewedUser}'s Cover`}
          style={{ touchAction: "pan-y" }}
          onClick={() =>
            openLightbox({
              mediaUrl: DEFAULT_BANNER,
              mediaType: "image",
              authorAvatar: avatar,
              authorName: viewedUser,
            })
          }
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer active:opacity-90 touch-pan-y pointer-events-auto"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 to-black/85 pointer-events-none" />

        {/* Top Header Floating Buttons: Back Arrow on Left, Share on Right */}
        <div
          className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none touch-pan-y"
          style={{ touchAction: "pan-y" }}
        >
          <button
            onClick={() => setView("feed")}
            className="p-2.5 bg-black/50 hover:bg-black/75 backdrop-blur-md text-white rounded-full transition shadow-lg border border-white/20 active:scale-95 pointer-events-auto"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => showToast(`Shared ${viewedUser}'s profile link!`)}
            className="p-2.5 bg-black/50 hover:bg-black/75 backdrop-blur-md text-white rounded-full transition shadow-lg border border-white/20 active:scale-95 pointer-events-auto"
            aria-label="Share"
          >
            <Share2 className="w-4.5 h-4.5 text-white" />
          </button>
        </div>
      </div>

      {/* 2. PROFILE INFO SECTION (SQUARE AVATAR, NAME, NICKNAME, BIO, STATS) */}
      <div
        className="px-4 sm:px-6 pt-1 pb-4 space-y-3 touch-pan-y"
        style={{ touchAction: "pan-y" }}
      >
        {/* Avatar & User Details Container */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex items-end gap-3.5">
            {/* Rounded Corner Square Avatar */}
            <div className="relative shrink-0 -mt-12 sm:-mt-14 z-10">
              <img
                src={avatar}
                alt={viewedUser}
                style={{ touchAction: "pan-y" }}
                onClick={() =>
                  openLightbox({
                    mediaUrl: avatar,
                    mediaType: "image",
                    authorAvatar: avatar,
                    authorName: viewedUser,
                  })
                }
                className="w-22 h-22 sm:w-26 sm:h-26 rounded-2xl border-4 border-slate-950 dark:border-black shadow-2xl object-cover bg-slate-900 cursor-pointer transition transform hover:scale-105 touch-pan-y"
              />
            </div>

            {/* Name, Handle */}
            <div className="min-w-0 flex-1 pt-1 space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {viewedUser}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                @{viewedUser.toLowerCase().replace(/\s+/g, "_")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 pt-0.5">
          <span>4K {t("followers")}</span>
          <span>·</span>
          <span>2 {t("following_count")}</span>
          <span>·</span>
          <span>1 {t("friends")}</span>
        </div>

        {/* User Bio */}
        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed pt-0.5">
          {isOwnProfile
            ? user.bio || "Creator & Digital Storyteller ✨ Living life one frame at a time."
            : "Digital creator & storyteller ✨ Spreading positivity & inspiration."}
        </p>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2.5 pt-1">
          {isOwnProfile ? (
            <>
              <button
                onClick={() => setView("account")}
                className="flex-1 py-2.5 px-5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white font-bold rounded-full border border-slate-700/60 shadow-sm text-sm text-center transition-all"
              >
                <span>{t("edit_profile")}</span>
              </button>
              <button
                onClick={() => setView("chats")}
                className="flex-1 py-2.5 px-5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white font-bold rounded-full border border-slate-700/60 shadow-sm text-sm text-center transition-all"
              >
                <span>{t("message")}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  toggleFollow(viewedUser);
                  showToast(
                    following
                      ? `${t("unfollow")} ${viewedUser}`
                      : `${t("following")} ${viewedUser}`,
                  );
                }}
                className={`flex-1 py-2.5 px-5 font-bold rounded-full shadow-sm text-sm text-center transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                  following
                    ? "bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white border border-slate-700/60"
                    : "bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white shadow-md shadow-pink-500/25"
                }`}
              >
                {following ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t("following")}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-white shrink-0" />
                    <span>{t("follow")}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setView("chats")}
                className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white font-bold rounded-full border border-slate-700/60 shadow-sm text-sm text-center transition-all"
              >
                <span>{t("message")}</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActionMenuOpen(true)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white rounded-full border border-slate-700/60 shadow-sm transition-all shrink-0 active:scale-95"
            aria-label="More"
          >
            <MoreHorizontal className="w-4.5 h-4.5 text-white" />
          </button>
        </div>
      </div>

      {/* 3. MEDIA PREVIEW GALLERY STRIP */}
      <div
        className="px-4 sm:px-6 py-3 border-t border-slate-800/80 my-2 touch-pan-y"
        style={{ touchAction: "pan-y" }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            {theirPhotoPosts.length > 0 ? theirPhotoPosts.length : 33} {t("photos")}
          </h3>
          <button
            onClick={() => setActiveTab("posts")}
            className="text-xs font-bold text-pink-500 hover:text-pink-400 flex items-center gap-1 transition"
          >
            <span>{t("all_photos")}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Scrollable Thumbnails Strip */}
        <div
          className="flex space-x-2.5 overflow-x-auto no-scrollbar py-1 touch-pan-x"
          style={{ touchAction: "pan-x pan-y" }}
        >
          {(theirPhotoPosts.length > 0
            ? theirPhotoPosts
            : theirPosts.filter((p) => Boolean(p.mediaUrl))
          )
            .slice(0, 10)
            .map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() =>
                  openLightbox({
                    mediaUrl: p.mediaUrl,
                    mediaType: p.mediaType,
                    authorAvatar: avatar,
                    authorName: viewedUser,
                    caption: p.caption,
                  })
                }
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800 cursor-pointer shadow-md group border border-slate-700/40"
              >
                <img
                  src={p.mediaUrl}
                  alt={p.caption || "Photo preview"}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </button>
            ))}
          {theirPhotoPosts.length === 0 && (
            <>
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
              ].map((url, i) => (
                <button
                  key={i}
                  onClick={() =>
                    openLightbox({
                      mediaUrl: url,
                      mediaType: "image",
                      authorAvatar: avatar,
                      authorName: viewedUser,
                      caption: "Photo gallery preview",
                    })
                  }
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800 cursor-pointer shadow-md group border border-slate-700/40"
                >
                  <img
                    src={url}
                    alt="Gallery item"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 4. "POSTS" & "ABOUT" NAVIGATION TABS WITH UNIFIED SCROLL FEED */}
      <div
        className="border-t border-slate-800/80 mt-2 touch-pan-y"
        style={{ touchAction: "pan-y" }}
      >
        {/* Section Tabs Row */}
        <div
          id="user-profile-tabs-bar"
          className={`flex border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-20 touch-pan-y transition-transform duration-300 ease-in-out will-change-transform ${
            isTabsHidden ? "-translate-y-full pointer-events-none" : "translate-y-0"
          }`}
          style={{ touchAction: "pan-y" }}
        >
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-3 text-center text-sm font-extrabold border-b-2 transition ${
              activeTab === "posts"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("posts_tab")}
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-3 text-center text-sm font-extrabold border-b-2 transition ${
              activeTab === "about"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("about")}
          </button>
        </div>

        {/* Content View */}
        {activeTab === "posts" && (
          <div className="px-4 sm:px-6 pt-3 space-y-4 touch-pan-y" style={{ touchAction: "pan-y" }}>
            {/* Filter Chips Horizontal Row */}
            <div
              className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 touch-pan-x"
              style={{ touchAction: "pan-x pan-y" }}
            >
              {(["All", "Feels", "Food", "Essentials", "Blood"] as FilterChip[]).map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveChip(chip)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                    activeChip === chip
                      ? "bg-pink-600 text-white shadow-md shadow-pink-500/25"
                      : "bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
                  }`}
                >
                  {chip === "All"
                    ? t("all")
                    : chip === "Feels"
                      ? t("feels")
                      : chip === "Food"
                        ? t("food")
                        : chip === "Essentials"
                          ? t("essentials")
                          : chip === "Blood"
                            ? t("blood")
                            : chip}
                </button>
              ))}
            </div>

            {/* UNIFIED SCROLL FEED */}
            <div className="space-y-4 touch-pan-y pb-24" style={{ touchAction: "pan-y" }}>
              {filteredFeed.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm font-medium">
                  {t("no_posts")}
                </div>
              ) : (
                filteredFeed.map((item, idx) => <FeedPost key={`${item.id}-${idx}`} post={item} />)
              )}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="px-4 sm:px-6 pt-4 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 space-y-3.5 shadow-xl">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Info className="w-4.5 h-4.5 text-pink-500" />
                {t("profile_overview")}
              </h3>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>{t("bio")}: ধৈর্ষের সীমারেখা মৃত্যু পর্যন্ত 💖</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>{t("location")}: San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>{t("joined")}: August 2024</span>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>
                    {t("account")}: {t("verified_creator")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. THREE-DOTS ACTION BOTTOM SHEET MODAL */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md touch-none overscroll-none animate-in fade-in duration-200"
          onClick={() => setActionMenuOpen(false)}
        >
          <div
            data-modal-scrollable="true"
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-[#18181b] border-t border-white/10 rounded-t-[28px] max-h-[85vh] overflow-y-auto shadow-2xl p-5 space-y-3 text-white animate-in slide-in-from-bottom duration-250 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="flex justify-center pb-1">
              <span className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <img
                  src={avatar}
                  alt={viewedUser}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1">
                    {viewedUser}
                    <span className="text-xs text-slate-400 font-normal">(তুলি)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    @{viewedUser.toLowerCase().replace(/\s+/g, "_")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Items */}
            <div className="space-y-1.5 pt-1">
              {/* Option 1: Follow / Unfollow */}
              <button
                onClick={() => {
                  toggleFollow(viewedUser);
                  showToast(
                    following
                      ? `${t("unfollow")} ${viewedUser}`
                      : `${t("following")} ${viewedUser}`,
                  );
                  setActionMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-900 active:bg-slate-800 text-left transition font-semibold text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition">
                    {following ? (
                      <UserCheck className="w-4.5 h-4.5" />
                    ) : (
                      <UserPlus className="w-4.5 h-4.5" />
                    )}
                  </div>
                  <span className="text-slate-100">
                    {following
                      ? `${t("unfollow")} @${viewedUser}`
                      : `${t("follow")} @${viewedUser}`}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Option 2: View Reels & Videos */}
              <button
                onClick={() => {
                  setActionMenuOpen(false);
                  if (theirReels.length > 0) {
                    openReel(theirReels[0].id);
                  } else {
                    setActiveTab("posts");
                    setActiveChip("Feels");
                  }
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-900 active:bg-slate-800 text-left transition font-semibold text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition">
                    <Film className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-slate-100">
                    {t("reels_tab")} &amp; {t("videos")} ({theirReels.length || "2"})
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Option 3: Share Profile */}
              <button
                onClick={() => {
                  setActionMenuOpen(false);
                  openShare(avatar, "image");
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-900 active:bg-slate-800 text-left transition font-semibold text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                    <Share2 className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-slate-100">
                    {t("share")} {t("profile")}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Option 4: Block / Report */}
              <button
                onClick={() => {
                  setActionMenuOpen(false);
                  showToast(`${t("report")} / ${t("block")} request submitted for @${viewedUser}`);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-red-500/10 active:bg-red-500/20 text-left transition font-semibold text-sm text-red-400 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition">
                    <Ban className="w-4.5 h-4.5" />
                  </div>
                  <span>
                    {t("block")} / {t("report")} @{viewedUser}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400/50" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
