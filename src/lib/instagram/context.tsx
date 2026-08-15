import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  initialChats,
  initialPosts,
  initialReels,
  initialStories,
  initialUser,
  type Chat,
  type Post,
  type Reel,
  type Story,
  type UserProfile,
} from "./data";
import { useLanguage, LanguageProvider } from "./LanguageContext";
import { loadFromIndexedDB } from "./media";
import { incrementLiveLoop } from "./insights";
import {
  fetchPostsFromSupabase,
  subscribeToPosts,
  upsertProfileToSupabase,
  toggleFollowInSupabase,
  type SupabasePost,
} from "@/lib/supabase";

export type ViewName =
  | "feed"
  | "search"
  | "reels"
  | "chats"
  | "profile"
  | "account"
  | "user-profile"
  | "saved-posts"
  | "help-support"
  | "sound-details";

export interface ActiveSound {
  id?: string | number;
  title: string;
  artist: string;
  cover?: string;
  audioUrl?: string;
  soundUrl?: string;
  reelsCount?: string;
  youtubeId?: string;
}

export interface LightboxState {
  open: boolean;
  mediaUrl: string;
  mediaType: "image" | "video";
  authorAvatar: string;
  authorName: string;
  caption?: string;
}

export interface StoryViewerState {
  open: boolean;
  index: number;
}

export interface UploadDraft {
  file: File;
  previewUrl: string;
  mediaType: "image" | "video";
}

export interface CommentItem {
  id: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  isLiked: boolean;
  pinned: boolean;
}

export interface CommentSheetState {
  open: boolean;
  key: string;
  ownerUsername: string;
}

export interface ShareSheetState {
  open: boolean;
  mediaUrl: string;
  mediaType: "image" | "video";
}

export type MediaKind = "post" | "reel";

export interface MediaRef {
  kind: MediaKind;
  id: number;
}

export interface OptionsSheetState extends MediaRef {
  open: boolean;
}

export interface PeekState extends MediaRef {
  open: boolean;
}

export interface SavedItem extends MediaRef {
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string;
  username: string;
  collection?: string;
}

import { translateKey, TranslationKeys } from "./translations";

interface AppState {
  /** Language context & i18n helper. */
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: TranslationKeys | string) => string;
  /** Landing welcome vs login view gate. */
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  /** Auth + onboarding gate. */
  authed: boolean;
  needsOnboarding: boolean;
  login: (method: "google" | "email") => void;
  logout: () => void;
  completeOnboarding: (patch: Partial<UserProfile>) => void;
  /** Third-party profile navigation. */
  viewedUser: string | null;
  openUserProfile: (username: string) => void;
  user: UserProfile;
  setUser: (u: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  view: ViewName;
  setView: (v: ViewName) => void;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  reels: Reel[];
  setReels: React.Dispatch<React.SetStateAction<Reel[]>>;
  stories: Story[];
  setStories: React.Dispatch<React.SetStateAction<Story[]>>;
  chats: Chat[];
  toggleLikePost: (id: number) => void;
  toggleBookmarkPost: (id: number) => void;
  addComment: (id: number, text: string) => void;
  toggleLikeReel: (id: number) => void;
  lightbox: LightboxState;
  openLightbox: (l: Omit<LightboxState, "open">) => void;
  closeLightbox: () => void;
  storyViewer: StoryViewerState;
  openStoryViewer: (index: number) => void;
  closeStoryViewer: () => void;
  uploadDraft: UploadDraft | null;
  setUploadDraft: (d: UploadDraft | null) => void;
  createPostModalOpen: boolean;
  setCreatePostModalOpen: (v: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  deleteAccountModalOpen: boolean;
  setDeleteAccountModalOpen: (v: boolean) => void;
  banned: boolean;
  setBanned: (v: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  /** Global audio state shared by every video in the app (Instagram-like). */
  isGlobalMuted: boolean;
  setGlobalMuted: (v: boolean) => void;
  toggleGlobalMute: () => void;
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  toggleTheme: () => void;
  /** Persistent follow state, keyed by username. */
  isFollowing: (username: string) => boolean;
  toggleFollow: (username: string) => void;
  /** Comment engine (shared by posts and reels). */
  commentsByKey: Record<string, CommentItem[]>;
  commentSheet: CommentSheetState;
  openComments: (key: string, ownerUsername: string) => void;
  closeComments: () => void;
  addCommentTo: (key: string, text: string) => void;
  toggleCommentLike: (key: string, id: string) => void;
  toggleCommentPin: (key: string, id: string) => void;
  /** Share sheet. */
  shareSheet: ShareSheetState;
  openShare: (mediaUrl: string, mediaType: "image" | "video") => void;
  closeShare: () => void;
  /** Home -> Reels deep link. */
  reelFocus: { id: number; time: number } | null;
  openReel: (id: number, time?: number) => void;
  clearReelFocus: () => void;
  /** Three-dots options sheet. */
  optionsSheet: OptionsSheetState;
  openOptions: (kind: MediaKind, id: number) => void;
  closeOptions: () => void;
  /** Long-press peek & pop preview. */
  peek: PeekState;
  openPeek: (kind: MediaKind, id: number) => void;
  closePeek: () => void;
  /** Saved / bookmarked collection. */
  savedItems: SavedItem[];
  isSaved: (kind: MediaKind, id: number) => boolean;
  toggleSaved: (item: SavedItem) => void;
  savedSheetOpen: boolean;
  setSavedSheetOpen: (v: boolean) => void;
  /** Instagram-style "Save to collection" bottom sheet flow. */
  saveTarget: SavedItem | null;
  openSaveSheet: (item: SavedItem) => void;
  closeSaveSheet: () => void;
  commitSave: (item: SavedItem, collection: string) => void;
  /** Feed reels carousel cards the user hid. */
  hiddenCarouselIds: number[];
  hideCarouselReel: (id: number) => void;
  /** Grid visibility toggle (peek menu). */
  isHiddenFromGrid: (id: number) => boolean;
  toggleGridVisibility: (id: number) => void;
  /** Edit / delete media. */
  updateMedia: (
    kind: MediaKind,
    id: number,
    patch: { caption?: string; location?: string },
  ) => void;
  deleteMedia: (kind: MediaKind, id: number) => void;
  /** Creator Reels Insights Dashboard Overlay */
  insightsModal: { open: boolean; reelId: number | null };
  openInsights: (reelId?: number) => void;
  closeInsights: () => void;
  registerReelLoop: (reelId: number) => void;
  /** Active Sound Detail Page state */
  activeSound: ActiveSound | null;
  openSoundDetails: (sound: ActiveSound) => void;
}

const Ctx = createContext<AppState | null>(null);

const PROFILE_KEY = "ig_userProfile";
const AUTH_KEY = "ig_authed";
const ONBOARD_KEY = "ig_onboarded";
const FOLLOW_KEY = "ig_following";
const SAVED_KEY = "ig_saved";

export function postKey(id: number) {
  return `post-${id}`;
}
export function reelKey(id: number) {
  return `reel-${id}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUserState] = useState<UserProfile>(initialUser);
  const [authed, setAuthed] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [viewedUser, setViewedUser] = useState<string | null>(null);
  const [view, setView] = useState<ViewName>("feed");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [reels, setReels] = useState<Reel[]>(initialReels);
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [chats] = useState<Chat[]>(initialChats);
  const [optionsSheet, setOptionsSheet] = useState<OptionsSheetState>({
    open: false,
    kind: "post",
    id: 0,
  });
  const [insightsModal, setInsightsModal] = useState<{ open: boolean; reelId: number | null }>({
    open: false,
    reelId: null,
  });

  const openInsights = useCallback((reelId?: number) => {
    setInsightsModal({ open: true, reelId: reelId ?? null });
  }, []);

  const closeInsights = useCallback(() => {
    setInsightsModal({ open: false, reelId: null });
  }, []);

  const registerReelLoop = useCallback((reelId: number) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          return incrementLiveLoop(r);
        }
        return r;
      }),
    );
  }, []);
  const [peek, setPeek] = useState<PeekState>({ open: false, kind: "post", id: 0 });
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [savedSheetOpen, setSavedSheetOpen] = useState(false);
  const [saveTarget, setSaveTarget] = useState<SavedItem | null>(null);
  const [hiddenCarouselIds, setHiddenCarouselIds] = useState<number[]>([]);
  const [hiddenGrid, setHiddenGrid] = useState<number[]>([]);
  const [lightbox, setLightbox] = useState<LightboxState>({
    open: false,
    mediaUrl: "",
    mediaType: "image",
    authorAvatar: "",
    authorName: "",
  });
  const [storyViewer, setStoryViewer] = useState<StoryViewerState>({
    open: false,
    index: 0,
  });
  const [uploadDraft, setUploadDraft] = useState<UploadDraft | null>(null);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [banned, setBanned] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [following, setFollowing] = useState<string[]>([]);
  const [commentsByKey, setCommentsByKey] = useState<Record<string, CommentItem[]>>({});
  const [commentSheet, setCommentSheet] = useState<CommentSheetState>({
    open: false,
    key: "",
    ownerUsername: "",
  });
  const [shareSheet, setShareSheet] = useState<ShareSheetState>({
    open: false,
    mediaUrl: "",
    mediaType: "video",
  });
  const [reelFocus, setReelFocus] = useState<{ id: number; time: number } | null>(null);

  // Global audio propagation: apply mute state to every video in the DOM.
  useEffect(() => {
    document.querySelectorAll("video").forEach((v) => {
      v.muted = isGlobalMuted;
      if (!isGlobalMuted) v.volume = 1;
    });
  }, [isGlobalMuted]);

  // Unlock Web Audio context upon the first user interaction gesture
  useEffect(() => {
    const unlockAudio = () => {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          const dummy = new AudioCtx();
          if (dummy.state === "suspended") {
            void dummy.resume();
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  const setGlobalMuted = useCallback((v: boolean) => setIsGlobalMuted(v), []);
  const toggleGlobalMute = useCallback(() => setIsGlobalMuted((m) => !m), []);

  // Theme: stored preference, otherwise follow the OS setting live.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("ig_theme");
    } catch {
      // ignore
    }
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    } else {
      setThemeState(mq.matches ? "light" : "dark");
      const onChange = (e: MediaQueryListEvent) => setThemeState(e.matches ? "light" : "dark");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setTheme = useCallback((t: "dark" | "light") => {
    setThemeState(t);
    try {
      localStorage.setItem("ig_theme", t);
    } catch {
      // ignore
    }
  }, []);
  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [setTheme, theme],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UserProfile>;
        // Guard: blob: URLs don't survive reload — fall back to defaults.
        if (typeof parsed.avatar === "string" && parsed.avatar.startsWith("blob:")) {
          parsed.avatar = initialUser.avatar;
        }
        if (typeof parsed.coverPhoto === "string" && parsed.coverPhoto.startsWith("blob:")) {
          parsed.coverPhoto = initialUser.coverPhoto;
        }
        setUserState({ ...initialUser, ...parsed });
      }
      if (localStorage.getItem("ig_banned") === "1") setBanned(true);
      if (localStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
      if (localStorage.getItem(AUTH_KEY) === "1" && localStorage.getItem(ONBOARD_KEY) !== "1") {
        setNeedsOnboarding(true);
      }
      const rawFollow = localStorage.getItem(FOLLOW_KEY);
      if (rawFollow) {
        const list = JSON.parse(rawFollow) as unknown;
        if (Array.isArray(list)) setFollowing(list.filter((x) => typeof x === "string"));
      }
      const rawSaved = localStorage.getItem(SAVED_KEY);
      if (rawSaved) {
        const list = JSON.parse(rawSaved) as unknown;
        if (Array.isArray(list)) setSavedItems(list as SavedItem[]);
      }
    } catch {
      // ignore
    }

    // Rehydrate user-uploaded posts/reels/stories from IndexedDB.
    void loadFromIndexedDB().then((records) => {
      if (records.length === 0) return;
      const rehydratedPosts: Post[] = [];
      const rehydratedReels: Reel[] = [];
      const rehydratedStories: Story[] = [];
      records
        .sort((a, b) => b.createdAt - a.createdAt)
        .forEach((rec) => {
          const payload = { ...(rec.payload as Record<string, unknown>) };
          if (rec.fileBlob) {
            payload.mediaUrl = URL.createObjectURL(rec.fileBlob);
          }
          if (rec.kind === "post") {
            rehydratedPosts.push(payload as unknown as Post);
          } else if (rec.kind === "reel") {
            const r = payload as unknown as Reel;
            rehydratedReels.push(r);
            rehydratedPosts.push({
              id: r.id,
              username: r.username,
              userAvatar: r.userAvatar,
              mediaUrl: r.mediaUrl,
              mediaType: "video",
              likes: r.likes,
              isLiked: r.isLiked,
              isBookmarked: false,
              caption: r.caption,
              timeAgo: "JUST NOW",
              comments: [],
              audioTrack: r.audioTrack,
              audioUrl: r.audioUrl || r.soundUrl,
              soundUrl: r.soundUrl || r.audioUrl,
            });
          } else if (rec.kind === "story") {
            rehydratedStories.push(payload as unknown as Story);
          }
        });
      if (rehydratedPosts.length) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newOnes = rehydratedPosts.filter((p) => !existingIds.has(p.id));
          return [...newOnes, ...prev];
        });
      }
      if (rehydratedReels.length) {
        setReels((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newOnes = rehydratedReels.filter((r) => !existingIds.has(r.id));
          return [...newOnes, ...prev];
        });
      }
      if (rehydratedStories.length) {
        setStories((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const newOnes = rehydratedStories.filter((s) => !existingIds.has(s.id));
          return [...newOnes, ...prev];
        });
      }
    });

    const convertSupabasePostToLocal = (s: SupabasePost, index = 0) => {
      let numId: number;
      if (typeof s.id === "number") {
        numId = s.id;
      } else if (typeof s.id === "string" && !isNaN(Number(s.id)) && Number(s.id) !== 0) {
        numId = Number(s.id);
      } else {
        numId = Date.now() + index + Math.floor(Math.random() * 10000);
      }
      if (s.kind === "story") {
        return {
          story: {
            id: numId,
            username: s.username,
            avatar: s.user_avatar || initialUser.avatar,
            mediaUrl: s.media_url,
            mediaType: s.media_type || "image",
            hasUnseen: true,
          } as Story,
        };
      } else if (s.kind === "reel" || (s.media_type === "video" && s.kind !== "post")) {
        return {
          reel: {
            id: numId,
            username: s.username,
            userAvatar: s.user_avatar || initialUser.avatar,
            mediaUrl: s.media_url,
            caption: s.caption || "",
            audioTrack: s.audio_track || `Original Audio - ${s.username}`,
            audioUrl: s.media_url,
            soundUrl: s.media_url,
            likes: s.likes || 0,
            commentsCount: 0,
            isLiked: false,
            views: "1.2K",
          } as Reel,
        };
      } else {
        return {
          post: {
            id: numId,
            username: s.username,
            userAvatar: s.user_avatar || initialUser.avatar,
            location: s.location || "",
            mediaUrl: s.media_url,
            mediaType: s.media_type || "image",
            likes: s.likes || 0,
            isLiked: false,
            isBookmarked: false,
            caption: s.caption || "",
            timeAgo: "RECENT",
            comments: [],
            audioTrack:
              s.media_type === "video"
                ? s.audio_track || `Original Audio - ${s.username}`
                : undefined,
            audioUrl: s.media_type === "video" ? s.media_url : undefined,
            soundUrl: s.media_type === "video" ? s.media_url : undefined,
          } as Post,
        };
      }
    };

    // Load dynamic posts & reels directly from Supabase
    void fetchPostsFromSupabase().then((supabasePosts) => {
      if (supabasePosts && supabasePosts.length > 0) {
        const sbPosts: Post[] = [];
        const sbReels: Reel[] = [];
        const sbStories: Story[] = [];

        supabasePosts.forEach((sp, idx) => {
          const res = convertSupabasePostToLocal(sp, idx);
          if (res.post) sbPosts.push(res.post);
          if (res.reel) sbReels.push(res.reel);
          if (res.story) sbStories.push(res.story);
        });

        if (sbPosts.length) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const existingUrls = new Set(prev.map((p) => p.mediaUrl));
            const newOnes: Post[] = [];
            for (const p of sbPosts) {
              if (!existingIds.has(p.id) && !existingUrls.has(p.mediaUrl)) {
                existingIds.add(p.id);
                existingUrls.add(p.mediaUrl);
                newOnes.push(p);
              }
            }
            return [...newOnes, ...prev];
          });
        }
        if (sbReels.length) {
          setReels((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const existingUrls = new Set(prev.map((r) => r.mediaUrl));
            const newOnes: Reel[] = [];
            for (const r of sbReels) {
              if (!existingIds.has(r.id) && !existingUrls.has(r.mediaUrl)) {
                existingIds.add(r.id);
                existingUrls.add(r.mediaUrl);
                newOnes.push(r);
              }
            }
            return [...newOnes, ...prev];
          });
        }
        if (sbStories.length) {
          setStories((prev) => {
            const existingIds = new Set(prev.map((s) => s.id));
            const existingUrls = new Set(prev.map((s) => s.mediaUrl));
            const newOnes: Story[] = [];
            for (const s of sbStories) {
              if (!existingIds.has(s.id) && !existingUrls.has(s.mediaUrl)) {
                existingIds.add(s.id);
                existingUrls.add(s.mediaUrl);
                newOnes.push(s);
              }
            }
            return [...newOnes, ...prev];
          });
        }
      }
    });

    // Real-time listener: subscribe to live changes in Supabase 'posts' table
    const unsubscribe = subscribeToPosts((sp) => {
      const res = convertSupabasePostToLocal(sp);
      if (res.post) {
        setPosts((prev) => {
          if (prev.some((p) => p.id === res.post!.id || p.mediaUrl === res.post!.mediaUrl))
            return prev;
          return [res.post!, ...prev];
        });
      }
      if (res.reel) {
        setReels((prev) => {
          if (prev.some((r) => r.id === res.reel!.id || r.mediaUrl === res.reel!.mediaUrl))
            return prev;
          return [res.reel!, ...prev];
        });
      }
      if (res.story) {
        setStories((prev) => {
          if (prev.some((s) => s.id === res.story!.id || s.mediaUrl === res.story!.mediaUrl))
            return prev;
          return [res.story!, ...prev];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const setUser = useCallback((u: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setUserState((prev) => {
      const next = typeof u === "function" ? (u as (p: UserProfile) => UserProfile)(prev) : u;
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
        void upsertProfileToSupabase({
          username: next.username,
          full_name: next.fullName,
          avatar_url: next.avatar,
          bio: next.bio,
          followers: next.followers,
          following: next.following,
        });
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const login = useCallback((_method: "google" | "email") => {
    void _method;
    setAuthed(true);
    setNeedsOnboarding(localStorage.getItem(ONBOARD_KEY) !== "1");
    try {
      localStorage.setItem(AUTH_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(ONBOARD_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(FOLLOW_KEY);
      localStorage.removeItem(SAVED_KEY);
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0]?.trim();
        if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
      });
    } catch {
      // ignore
    }
    setUserState(initialUser);
    setSavedItems([]);
    setFollowing([]);
    setNeedsOnboarding(false);
    setAuthed(false);
    setShowLogin(false);
    setView("feed");
  }, []);

  const openUserProfile = useCallback((username: string) => {
    setViewedUser(username);
    setView("user-profile");
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  }, []);

  const completeOnboarding = useCallback(
    (patch: Partial<UserProfile>) => {
      setUser((prev) => ({ ...prev, ...patch }));
      try {
        localStorage.setItem(ONBOARD_KEY, "1");
      } catch {
        // ignore
      }
      setNeedsOnboarding(false);
    },
    [setUser],
  );

  const isFollowing = useCallback((username: string) => following.includes(username), [following]);

  const toggleFollow = useCallback(
    (username: string) => {
      if (username && user.username && username.toLowerCase() === user.username.toLowerCase()) {
        showToast("You cannot follow your own account");
        return;
      }
      setFollowing((prev) => {
        const isNowFollowing = !prev.includes(username);
        const next = isNowFollowing ? [...prev, username] : prev.filter((u) => u !== username);
        try {
          localStorage.setItem(FOLLOW_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        // Async sync with Supabase `follows` table
        if (user.username) {
          void toggleFollowInSupabase(user.username, username, isNowFollowing);
        }
        return next;
      });
    },
    [user.username, showToast],
  );

  const openComments = useCallback((key: string, ownerUsername: string) => {
    setCommentSheet({ open: true, key, ownerUsername });
  }, []);
  const closeComments = useCallback(() => setCommentSheet((s) => ({ ...s, open: false })), []);

  const addCommentTo = useCallback(
    (key: string, text: string) => {
      const entry: CommentItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        username: user.username,
        avatar: user.avatar,
        text,
        likes: 0,
        isLiked: false,
        pinned: false,
      };
      setCommentsByKey((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), entry] }));
    },
    [user.avatar, user.username],
  );

  const toggleCommentLike = useCallback((key: string, id: string) => {
    setCommentsByKey((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).map((c) =>
        c.id === id ? { ...c, isLiked: !c.isLiked, likes: c.likes + (c.isLiked ? -1 : 1) } : c,
      ),
    }));
  }, []);

  const toggleCommentPin = useCallback((key: string, id: string) => {
    setCommentsByKey((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    }));
  }, []);

  const addComment = useCallback(
    (id: number, text: string) => addCommentTo(postKey(id), text),
    [addCommentTo],
  );

  const openShare = useCallback(
    (mediaUrl: string, mediaType: "image" | "video") =>
      setShareSheet({ open: true, mediaUrl, mediaType }),
    [],
  );
  const closeShare = useCallback(() => setShareSheet((s) => ({ ...s, open: false })), []);

  const toggleLikePost = useCallback(
    (id: number) => {
      const post = posts.find((p) => p.id === id);
      if (
        post &&
        post.username &&
        user.username &&
        post.username.toLowerCase() === user.username.toLowerCase()
      ) {
        showToast(
          post.mediaType === "video"
            ? "You cannot like your own video"
            : "You cannot like your own post",
        );
        return;
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) } : p,
        ),
      );
    },
    [posts, user.username, showToast],
  );

  const toggleBookmarkPost = useCallback((id: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p)),
    );
  }, []);

  const toggleLikeReel = useCallback(
    (id: number) => {
      const reel = reels.find((r) => r.id === id);
      if (
        reel &&
        reel.username &&
        user.username &&
        reel.username.toLowerCase() === user.username.toLowerCase()
      ) {
        showToast("You cannot like your own video");
        return;
      }
      const post = posts.find((p) => p.id === id);
      if (
        post &&
        post.username &&
        user.username &&
        post.username.toLowerCase() === user.username.toLowerCase()
      ) {
        showToast("You cannot like your own video");
        return;
      }

      let matched = false;
      setReels((prev) => {
        matched = prev.some((r) => r.id === id);
        return prev.map((r) =>
          r.id === id ? { ...r, isLiked: !r.isLiked, likes: r.likes + (r.isLiked ? -1 : 1) } : r,
        );
      });
      if (!matched) {
        // Derived reel (a feed video post recommended into Reels).
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) } : p,
          ),
        );
      }
    },
    [reels, posts, user.username, showToast],
  );

  // Unified recommendation engine: feed video posts are also playable in Reels.
  const mergedReels = useMemo<Reel[]>(() => {
    const seenUrls = new Set(reels.map((r) => r.mediaUrl));
    const seenIds = new Set(reels.map((r) => r.id));
    const derived: Reel[] = posts
      .filter((p) => p.mediaType === "video" && !seenUrls.has(p.mediaUrl) && !seenIds.has(p.id))
      .map((p) => ({
        id: p.id,
        username: p.username,
        userAvatar: p.userAvatar,
        mediaUrl: p.mediaUrl,
        caption: p.caption,
        audioTrack: p.audioTrack || `Original Audio - ${p.username}`,
        audioUrl: p.audioUrl || p.soundUrl,
        soundUrl: p.soundUrl || p.audioUrl,
        likes: p.likes,
        commentsCount: (commentsByKey[postKey(p.id)] ?? []).length,
        isLiked: p.isLiked,
        views: "—",
      }));
    const combined: Reel[] = [];
    const usedIds = new Set<number>();
    for (const r of [...reels, ...derived]) {
      if (!usedIds.has(r.id)) {
        usedIds.add(r.id);
        combined.push(r);
      }
    }
    return combined;
  }, [reels, posts, commentsByKey]);

  const openReel = useCallback((id: number, time = 0) => {
    setReelFocus({ id, time });
    setView("reels");
  }, []);
  const clearReelFocus = useCallback(() => setReelFocus(null), []);

  const openOptions = useCallback(
    (kind: MediaKind, id: number) => setOptionsSheet({ open: true, kind, id }),
    [],
  );
  const closeOptions = useCallback(() => setOptionsSheet((s) => ({ ...s, open: false })), []);

  const openPeek = useCallback(
    (kind: MediaKind, id: number) => setPeek({ open: true, kind, id }),
    [],
  );
  const closePeek = useCallback(() => setPeek((s) => ({ ...s, open: false })), []);

  const isSaved = useCallback(
    (kind: MediaKind, id: number) => savedItems.some((s) => s.kind === kind && s.id === id),
    [savedItems],
  );

  const toggleSaved = useCallback((item: SavedItem) => {
    setSavedItems((prev) => {
      const exists = prev.some((s) => s.kind === item.kind && s.id === item.id);
      const next = exists
        ? prev.filter((s) => !(s.kind === item.kind && s.id === item.id))
        : [item, ...prev];
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isBookmarked: !p.isBookmarked } : p)),
    );
  }, []);

  const openSaveSheet = useCallback((item: SavedItem) => setSaveTarget(item), []);
  const closeSaveSheet = useCallback(() => setSaveTarget(null), []);
  const commitSave = useCallback((item: SavedItem, collection: string) => {
    setSavedItems((prev) => {
      const next = [
        { ...item, collection },
        ...prev.filter((s) => !(s.kind === item.kind && s.id === item.id)),
      ];
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setSaveTarget(null);
  }, []);

  const hideCarouselReel = useCallback(
    (id: number) => setHiddenCarouselIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [],
  );

  const isHiddenFromGrid = useCallback((id: number) => hiddenGrid.includes(id), [hiddenGrid]);
  const toggleGridVisibility = useCallback((id: number) => {
    setHiddenGrid((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const updateMedia = useCallback(
    (kind: MediaKind, id: number, patch: { caption?: string; location?: string }) => {
      if (kind === "reel") {
        setReels((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, ...(patch.caption ? { caption: patch.caption } : {}) } : r,
          ),
        );
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...(patch.caption !== undefined ? { caption: patch.caption } : {}),
                ...(patch.location !== undefined ? { location: patch.location } : {}),
              }
            : p,
        ),
      );
    },
    [],
  );

  const deleteMedia = useCallback((kind: MediaKind, id: number) => {
    if (kind === "reel") setReels((prev) => prev.filter((r) => r.id !== id));
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setSavedItems((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const [activeSound, setActiveSound] = useState<ActiveSound | null>(null);

  const openSoundDetails = useCallback((sound: ActiveSound) => {
    setActiveSound(sound);
    setView("sound-details");
  }, []);

  const openLightbox = useCallback((l: Omit<LightboxState, "open">) => {
    setLightbox({ ...l, open: true });
  }, []);
  const closeLightbox = useCallback(() => setLightbox((prev) => ({ ...prev, open: false })), []);

  const openStoryViewer = useCallback((index: number) => setStoryViewer({ open: true, index }), []);
  const closeStoryViewer = useCallback(() => setStoryViewer({ open: false, index: 0 }), []);

  const value = useMemo<AppState>(
    () => ({
      language,
      setLanguage,
      t,
      showLogin,
      setShowLogin,
      authed,
      needsOnboarding,
      login,
      logout,
      completeOnboarding,
      viewedUser,
      openUserProfile,
      user,
      setUser,
      view,
      setView,
      posts,
      setPosts,
      reels: mergedReels,
      setReels,
      stories,
      setStories,
      chats,
      toggleLikePost,
      toggleBookmarkPost,
      addComment,
      toggleLikeReel,
      lightbox,
      openLightbox,
      closeLightbox,
      storyViewer,
      openStoryViewer,
      closeStoryViewer,
      uploadDraft,
      setUploadDraft,
      createPostModalOpen,
      setCreatePostModalOpen,
      settingsOpen,
      setSettingsOpen,
      deleteAccountModalOpen,
      setDeleteAccountModalOpen,
      banned,
      setBanned: (v: boolean) => {
        setBanned(v);
        try {
          if (v) localStorage.setItem("ig_banned", "1");
          else localStorage.removeItem("ig_banned");
        } catch {
          // ignore
        }
      },
      toast,
      showToast,
      isGlobalMuted,
      setGlobalMuted,
      toggleGlobalMute,
      theme,
      setTheme,
      toggleTheme,
      isFollowing,
      toggleFollow,
      commentsByKey,
      commentSheet,
      openComments,
      closeComments,
      addCommentTo,
      toggleCommentLike,
      toggleCommentPin,
      shareSheet,
      openShare,
      closeShare,
      reelFocus,
      openReel,
      clearReelFocus,
      optionsSheet,
      openOptions,
      closeOptions,
      peek,
      openPeek,
      closePeek,
      savedItems,
      isSaved,
      toggleSaved,
      savedSheetOpen,
      setSavedSheetOpen,
      saveTarget,
      openSaveSheet,
      closeSaveSheet,
      commitSave,
      hiddenCarouselIds,
      hideCarouselReel,
      isHiddenFromGrid,
      toggleGridVisibility,
      updateMedia,
      deleteMedia,
      insightsModal,
      openInsights,
      closeInsights,
      registerReelLoop,
      activeSound,
      openSoundDetails,
    }),
    [
      language,
      setLanguage,
      t,
      showLogin,
      setShowLogin,
      authed,
      needsOnboarding,
      login,
      logout,
      completeOnboarding,
      viewedUser,
      openUserProfile,
      user,
      setUser,
      view,
      posts,
      mergedReels,
      stories,
      chats,
      toggleLikePost,
      toggleBookmarkPost,
      addComment,
      toggleLikeReel,
      lightbox,
      openLightbox,
      closeLightbox,
      storyViewer,
      openStoryViewer,
      closeStoryViewer,
      uploadDraft,
      createPostModalOpen,
      settingsOpen,
      deleteAccountModalOpen,
      banned,
      toast,
      showToast,
      isGlobalMuted,
      setGlobalMuted,
      toggleGlobalMute,
      theme,
      setTheme,
      toggleTheme,
      isFollowing,
      toggleFollow,
      commentsByKey,
      commentSheet,
      openComments,
      closeComments,
      addCommentTo,
      toggleCommentLike,
      toggleCommentPin,
      shareSheet,
      openShare,
      closeShare,
      reelFocus,
      openReel,
      clearReelFocus,
      optionsSheet,
      openOptions,
      closeOptions,
      peek,
      openPeek,
      closePeek,
      savedItems,
      isSaved,
      toggleSaved,
      savedSheetOpen,
      saveTarget,
      openSaveSheet,
      closeSaveSheet,
      commitSave,
      hiddenCarouselIds,
      hideCarouselReel,
      isHiddenFromGrid,
      toggleGridVisibility,
      updateMedia,
      deleteMedia,
      insightsModal,
      openInsights,
      closeInsights,
      registerReelLoop,
      activeSound,
      openSoundDetails,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { useLanguage, LanguageProvider } from "./LanguageContext";
