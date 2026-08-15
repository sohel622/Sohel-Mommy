export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
export const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

export type MediaType = "image" | "video";

export interface Story {
  id: number;
  username: string;
  avatar: string;
  mediaUrl: string;
  mediaType: MediaType;
  hasUnseen: boolean;
}

export interface Comment {
  username: string;
  text: string;
}

export interface Post {
  id: number;
  username: string;
  userAvatar: string;
  location?: string;
  mediaUrl: string;
  mediaType: MediaType;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  caption: string;
  timeAgo: string;
  comments: Comment[];
  audioTrack?: string;
  audioUrl?: string;
  soundUrl?: string;
}

export interface ReelInsights {
  loopCount: number;
  initialPlays: number;
  replays: number;
  completionRate: number; // percentage (0-100)
  avgWatchTime: number; // seconds
  totalDuration: number; // seconds
  totalWatchTimeHours: number;
  accountsReached: number;
  nonFollowerRatio: number; // percentage
  saves: number;
  shares: number;
  profileVisits: number;
  followsGained: number;
  retentionPoints: { second: number; percentage: number }[];
  trafficSources: { name: string; percentage: number; color: string }[];
  topLocations: { city: string; percentage: number }[];
  genderSplit: { male: number; female: number; other: number };
}

export interface Reel {
  id: number;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  caption: string;
  audioTrack: string;
  audioUrl?: string;
  soundUrl?: string;
  likes: number;
  commentsCount: number;
  isLiked: boolean;
  views: string;
  isCurrentUser?: boolean;
  insights?: ReelInsights;
}

export interface Chat {
  id: number;
  username: string;
  avatar: string;
  lastMsg: string;
  unread: boolean;
}

export interface Suggestion {
  username: string;
  relation: string;
  avatar: string;
}

export interface UserProfile {
  username: string;
  fullName: string;
  bio: string;
  uid: string;
  location: string;
  avatar: string;
  coverPhoto: string;
  posts: number;
  followers: number;
  following: number;
  phone?: string;
  country?: string;
  language?: string;
}

export const initialUser: UserProfile = {
  username: "Sohel Mommy",
  fullName: "Sohel Rivera",
  bio: "Full-stack dev · UI craftsperson · Building beautiful things ✨",
  uid: "104729581",
  location: "San Francisco, CA",
  avatar: DEFAULT_AVATAR,
  coverPhoto: DEFAULT_BANNER,
  posts: 24,
  followers: 12400,
  following: 318,
};

export const initialStories: Story[] = [
  {
    id: 1,
    username: "sarah_design",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    hasUnseen: true,
  },
  {
    id: 2,
    username: "creative_coder",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    hasUnseen: true,
  },
  {
    id: 3,
    username: "travel_bug",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    hasUnseen: true,
  },
  {
    id: 4,
    username: "sohel",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80",
    mediaUrl:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    hasUnseen: false,
  },
];

export const initialPosts: Post[] = [
  {
    id: 101,
    username: "travel_bug",
    userAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    location: "Kyoto, Japan",
    mediaUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    likes: 1243,
    isLiked: false,
    isBookmarked: false,
    caption:
      "Lost in the serene bamboo groves of Kyoto 🎋✨ Nothing beats early morning walks in Japan.",
    timeAgo: "2 HOURS AGO",
    comments: [],
  },
  {
    id: 102,
    username: "creative_coder",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    location: "San Francisco, CA",
    mediaUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    mediaType: "video",
    likes: 3410,
    isLiked: true,
    isBookmarked: false,
    caption: "High speed ocean waves in 4K resolution 🌊 Feel the breeze!",
    timeAgo: "4 HOURS AGO",
    comments: [],
  },
  {
    id: 103,
    username: "sarah_design",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    location: "Barcelona, Spain",
    mediaUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    likes: 892,
    isLiked: false,
    isBookmarked: true,
    caption: "Golden hour on the terrace 🌇",
    timeAgo: "6 HOURS AGO",
    comments: [],
  },
];

export const initialReels: Reel[] = [
  {
    id: 201,
    username: "Sohel Mommy",
    isCurrentUser: true,
    userAvatar: DEFAULT_AVATAR,
    mediaUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    caption: "Blazing fast UI renders in pure React! 🚀",
    audioTrack: "Original Audio - Sohel Mommy",
    likes: 18400,
    commentsCount: 342,
    isLiked: false,
    views: "132K",
  },
  {
    id: 202,
    username: "nature_world",
    userAvatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    mediaUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    caption: "Escape into the wilderness 🏔️ Nature is calling.",
    audioTrack: "Chill Waves Vol. 4",
    likes: 42100,
    commentsCount: 912,
    isLiked: true,
    views: "45.8K",
  },
  {
    id: 203,
    username: "creative_coder",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    caption: "Weekend vibes ☀️",
    audioTrack: "Sunset Groove - DJ Mira",
    likes: 9820,
    commentsCount: 210,
    isLiked: false,
    views: "22.4K",
  },
];

export const initialChats: Chat[] = [
  {
    id: 1,
    username: "sarah_design",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    lastMsg: "Sent a story reply • 12m",
    unread: true,
  },
  {
    id: 2,
    username: "creative_coder",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    lastMsg: "The new UI design looks crisp! 👌",
    unread: false,
  },
  {
    id: 3,
    username: "travel_bug",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    lastMsg: "Loved your Kyoto post!",
    unread: false,
  },
];

export const suggestions: Suggestion[] = [];

export const presetAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
];

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
