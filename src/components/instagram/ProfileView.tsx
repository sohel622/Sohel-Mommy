import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  Settings,
  X,
  Home,
  Users,
  Bookmark,
  HelpCircle,
  LogOut,
  ImageIcon,
  Share2,
  Pencil,
  Sparkles,
  Film,
  Package,
  Bell,
  MoreHorizontal,
  Star,
  UserX,
  ChevronRight,
  ArrowLeft,
  Heart,
  MessageSquare,
  Plus,
  Info,
  MapPin,
  Calendar,
  Layers,
} from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { formatCount, presetAvatars, type Post } from "@/lib/instagram/data";
import { fileToBase64, getSafeVideoSrc } from "@/lib/instagram/media";
import { uploadMediaToSupabase, upsertProfileToSupabase } from "@/lib/supabase";
import { useAutoHideOnScroll } from "@/lib/instagram/useAutoHideOnScroll";
import { FeedPost } from "./FeedPost";
import { Drawer } from "./Drawer";

type CategoryTab = "posts" | "about";
type FilterChip = "All" | "Feels" | "Food" | "Essentials" | "Blood";

export function ProfileView() {
  const {
    user,
    setUser,
    setView,
    openLightbox,
    showToast,
    posts,
    reels,
    isHiddenFromGrid,
    setUploadDraft,
    logout,
    setDeleteAccountModalOpen,
    setSettingsOpen,
    toggleLikePost,
    toggleLikeReel,
    openComments,
    openShare,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<CategoryTab>("posts");
  const [activeChip, setActiveChip] = useState<FilterChip>("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(user.avatar);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLElement>(null);
  const { isTabsHidden } = useAutoHideOnScroll(scrollContainerRef);

  const triggerCoverUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      showToast("Uploading cover photo...");
      const uploadedUrl = await uploadMediaToSupabase(file, "covers");
      const finalUrl = uploadedUrl || (await fileToBase64(file));
      setUser((prev) => {
        const next = { ...prev, coverPhoto: finalUrl };
        void upsertProfileToSupabase({
          username: next.username,
          full_name: next.fullName,
          avatar_url: next.avatar,
          bio: next.bio,
          followers: next.followers,
          following: next.following,
        });
        return next;
      });
      showToast("Cover photo updated");
    };
    input.click();
  };

  const triggerAvatarFromAlbum = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      showToast("Uploading avatar...");
      const uploadedUrl = await uploadMediaToSupabase(file, "avatars");
      const finalUrl = uploadedUrl || (await fileToBase64(file));
      setPendingAvatar(finalUrl);
    };
    input.click();
  };

  const confirmAvatar = () => {
    setUser((prev) => ({ ...prev, avatar: pendingAvatar }));
    setAvatarSheetOpen(false);
    showToast("Avatar updated");
  };

  // Filtered User Posts
  const userPosts = posts.filter(
    (p) =>
      p.username === user.username || p.username === "Sohel Mommy" || p.username === user.fullName,
  );

  const userPhotoPosts = userPosts.filter((p) => p.mediaType === "image" && Boolean(p.mediaUrl));
  const userReels = reels.filter(
    (r) =>
      (r.username === user.username || r.username === "Sohel Mommy" || r.isCurrentUser) &&
      !isHiddenFromGrid(r.id),
  );

  // Combine Photos & Video Reels into a Unified Feed list of Post items
  const unifiedFeed = useMemo<Post[]>(() => {
    const seenIds = new Set<number>();
    const seenUrls = new Set<string>();
    const list: Post[] = [];

    for (const p of userPosts) {
      if (!seenIds.has(p.id) && !seenUrls.has(p.mediaUrl)) {
        seenIds.add(p.id);
        seenUrls.add(p.mediaUrl);
        list.push({
          ...p,
          userAvatar: p.userAvatar || user.avatar,
          fullName: user.fullName || p.fullName || "Tamanna Islam(তুলি)",
          caption: p.caption || "living my best life ✨ #hopenity #vairal #aesthetic",
          timeAgo: p.timeAgo || "4 days ago",
          likesCount: p.likesCount ?? (p as unknown as { likes?: number }).likes ?? 68,
          commentsCount: p.commentsCount ?? p.comments?.length ?? 24,
          isLiked: p.isLiked,
        });
      }
    }

    for (const r of userReels) {
      if (!seenIds.has(r.id) && !seenUrls.has(r.mediaUrl)) {
        seenIds.add(r.id);
        seenUrls.add(r.mediaUrl);
        list.push({
          id: r.id,
          userId: r.userId || user.id,
          username: r.username,
          userAvatar: r.userAvatar || user.avatar,
          fullName: user.fullName || "Tamanna Islam(তুলি)",
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
  }, [userPosts, userReels, user]);

  // Apply Filter Chips
  const filteredFeed = unifiedFeed.filter((item) => {
    if (activeChip === "All") return true;
    if (activeChip === "Feels")
      return item.mediaType === "video" || item.caption.toLowerCase().includes("feel");
    if (activeChip === "Food")
      return (
        item.caption.toLowerCase().includes("food") ||
        item.caption.toLowerCase().includes("delicious")
      );
    if (activeChip === "Essentials")
      return item.caption.toLowerCase().includes("essential") || item.mediaType === "image";
    if (activeChip === "Blood")
      return item.caption.toLowerCase().includes("blood") || item.mediaType === "image";
    return true;
  });

  return (
    <section
      id="profile-view"
      ref={scrollContainerRef}
      className="w-full max-w-[935px] mx-auto pb-28 relative h-[calc(100dvh-6rem)] md:h-[calc(100dvh-3rem)] overflow-y-auto overscroll-y-contain will-change-transform text-slate-100 touch-pan-y scroll-smooth"
      style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
    >
      {/* 1. TOP COVER BANNER & HEADER NAVIGATION */}
      <div
        className="relative w-full h-[210px] sm:h-[260px] bg-slate-900 rounded-b-3xl overflow-hidden shadow-2xl touch-pan-y"
        style={{ touchAction: "pan-y" }}
      >
        {/* Cover Photo */}
        <img
          src={user.coverPhoto || DEFAULT_BANNER}
          alt={`${user.fullName || user.username}'s Cover`}
          style={{ touchAction: "pan-y" }}
          onClick={() =>
            openLightbox({
              mediaUrl: user.coverPhoto || DEFAULT_BANNER,
              mediaType: "image",
              authorAvatar: user.avatar || DEFAULT_AVATAR,
              authorName: user.username,
              caption: `${user.fullName || user.username}'s Cover Photo`,
            })
          }
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer active:opacity-90 touch-pan-y pointer-events-auto"
        />

        {/* Gradient Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 to-black/85 pointer-events-none" />

        {/* Top Header Floating Buttons: Back Arrow on Left, Share/Menu on Right */}
        <div
          className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none touch-pan-y"
          style={{ touchAction: "pan-y" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Back Arrow */}
          <button
            onClick={() => setView("feed")}
            className="p-2.5 bg-black/50 hover:bg-black/75 backdrop-blur-md text-white rounded-full transition shadow-lg border border-white/20 active:scale-95 pointer-events-auto"
            aria-label="Back to Feed"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2.5 bg-black/50 hover:bg-black/75 backdrop-blur-md text-white rounded-full transition shadow-lg border border-white/20 active:scale-95 pointer-events-auto flex items-center justify-center"
              aria-label={t("settings") || "Settings"}
              title={t("settings") || "Settings"}
            >
              <Settings className="w-4.5 h-4.5 text-white" />
            </button>

            <button
              onClick={() => setPlusMenuOpen((prev) => !prev)}
              title={plusMenuOpen ? "Close menu" : "More actions"}
              className={`p-2.5 bg-black/50 hover:bg-black/75 backdrop-blur-md text-white rounded-full transition-all duration-200 shadow-lg border border-white/20 active:scale-95 pointer-events-auto flex items-center justify-center ${
                plusMenuOpen ? "bg-pink-600/90 border-pink-400 rotate-45" : ""
              }`}
              aria-label="Change photo or avatar"
            >
              <Plus className="w-4.5 h-4.5 text-white" />
            </button>
          </div>
        </div>

        {/* Floating Cover Upload Submenu */}
        {plusMenuOpen && (
          <div className="absolute top-16 right-4 z-30 flex flex-col gap-2 p-2 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
            <button
              onClick={() => {
                triggerCoverUpload();
                setPlusMenuOpen(false);
              }}
              className="px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 rounded-xl flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-pink-400" />
              <span>{t("change_cover")}</span>
            </button>
            <button
              onClick={() => {
                setAvatarSheetOpen(true);
                setPlusMenuOpen(false);
              }}
              className="px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 rounded-xl flex items-center gap-2"
            >
              <Pencil className="w-4 h-4 text-pink-400" />
              <span>{t("change_avatar")}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. PROFILE INFO SECTION (SQUARE AVATAR, NAME, BIO, STATS) */}
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
                src={user.avatar || DEFAULT_AVATAR}
                alt="Avatar"
                style={{ touchAction: "pan-y" }}
                onClick={() =>
                  openLightbox({
                    mediaUrl: user.avatar || DEFAULT_AVATAR,
                    mediaType: "image",
                    authorAvatar: user.avatar || DEFAULT_AVATAR,
                    authorName: user.username,
                    caption: `${user.fullName || user.username}'s Profile Picture`,
                  })
                }
                className="w-22 h-22 sm:w-26 sm:h-26 rounded-2xl border-4 border-slate-950 dark:border-black shadow-2xl object-cover bg-slate-900 cursor-pointer transition transform hover:scale-105 touch-pan-y"
              />
            </div>

            {/* Name, Handle */}
            <div className="min-w-0 flex-1 pt-1 space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {user.fullName || user.username}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                @{user.username.toLowerCase().replace(/\s+/g, "_")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 pt-0.5">
          <span>
            {formatCount(user.followers || 4200)} {t("followers")}
          </span>
          <span>·</span>
          <span>
            {formatCount(user.following || 2)} {t("following")}
          </span>
          <span>·</span>
          <span>1 {t("friends")}</span>
        </div>

        {/* User Bio */}
        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed pt-0.5">
          {user.bio || "ধৈর্য্যের সীমারেখা মৃত্যু পর্যন্ত 💖"}
        </p>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={() => setView("account")}
            className="flex-1 py-2.5 px-5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white font-bold rounded-full border border-slate-700/60 shadow-sm text-sm text-center transition-all"
          >
            <span>{t("edit_profile")}</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({
                    title: `${user.fullName || user.username} (@${user.username})`,
                    text: `Check out ${user.fullName || user.username}'s profile on Tweetgram!`,
                    url: window.location.href,
                  })
                  .catch(() => openShare(user.avatar || DEFAULT_AVATAR, "image"));
              } else {
                openShare(user.avatar || DEFAULT_AVATAR, "image");
              }
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-white rounded-full border border-slate-700/60 shadow-sm transition-all shrink-0 active:scale-95 flex items-center justify-center"
            aria-label={t("share") || "Share Profile"}
            title={t("share") || "Share Profile"}
          >
            <Share2 className="w-4.5 h-4.5 text-white" />
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
            {userPhotoPosts.length > 0 ? userPhotoPosts.length : 33} {t("photos")}
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
          {(userPhotoPosts.length > 0
            ? userPhotoPosts
            : userPosts.filter((p) => Boolean(p.mediaUrl))
          )
            .slice(0, 10)
            .map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() =>
                  openLightbox({
                    mediaUrl: p.mediaUrl,
                    mediaType: p.mediaType,
                    authorAvatar: p.userAvatar || user.avatar || DEFAULT_AVATAR,
                    authorName: p.username,
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
          {userPhotoPosts.length === 0 && (
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
                      authorAvatar: user.avatar,
                      authorName: user.username,
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
          id="profile-tabs-bar"
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
                <EmptyPhotosGrid />
              ) : (
                filteredFeed.map((item) => <FeedPost key={item.id} post={item} />)
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
                  <span>Bio: {user.bio || "ধৈর্যের সীমারেখা মৃত্যু পর্যন্ত 💖"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Location: {user.location || "San Francisco, CA"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Joined: August 2024</span>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>UID: {user.uid}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Avatar Selection Sheet */}
      {avatarSheetOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[80] flex flex-col justify-end">
          <button
            className="absolute inset-0 z-0"
            onClick={() => setAvatarSheetOpen(false)}
            aria-label="Close"
          />
          <div className="relative glass-card bg-slate-900 border-t border-slate-800 rounded-t-3xl max-w-lg w-full mx-auto p-5 space-y-5 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">Select Creator Avatar</h3>
              <button
                onClick={() => setAvatarSheetOpen(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Recommended Characters
              </span>
              <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
                {presetAvatars.map((a) => (
                  <button
                    key={a}
                    onClick={() => setPendingAvatar(a)}
                    className={`flex-shrink-0 rounded-full p-[2px] ${pendingAvatar === a ? "story-ring" : "bg-slate-700"}`}
                  >
                    <img
                      src={a}
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-900"
                      alt="Preset"
                    />
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={triggerAvatarFromAlbum}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-sm transition border border-slate-700/80"
            >
              Select from album
            </button>
            <div className="flex items-center gap-3">
              <img
                src={pendingAvatar}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500"
                alt="Preview"
              />
              <span className="text-sm text-slate-300">Preview</span>
            </div>
            <button
              onClick={confirmAvatar}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Side Navigation Drawer Overlay */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}

function EmptyPhotosGrid() {
  const { setUploadDraft, showToast, t } = useApp();
  const openUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const previewUrl = URL.createObjectURL(file);
      setUploadDraft({ file, previewUrl, mediaType: "image" });
    };
    input.click();
    showToast("Choose photo to share");
  };
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
        <Package className="w-7 h-7" />
      </div>
      <div>
        <p className="text-slate-100 font-semibold">{t("no_posts")}</p>
        <p className="text-xs text-slate-500 mt-1">
          Share photo posts or video reels to display on your profile.
        </p>
      </div>
      <button
        onClick={openUpload}
        className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold rounded-full shadow-lg transition"
      >
        {t("create")}
      </button>
    </div>
  );
}
