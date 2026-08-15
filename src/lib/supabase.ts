import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://oppwfervzdiogunonbot.supabase.co";
export const SUPABASE_ANON_KEY = "Sb_publishable_c8T9hDVS7sPjifDx0RDmIA_2RKrArbx";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const STORAGE_BUCKET = "media";

/**
 * Uploads an image or video file directly to the Supabase Storage bucket named `media`.
 * Returns the public URL of the uploaded file or null if upload failed.
 */
export async function uploadMediaToSupabase(
  file: File,
  folder = "uploads",
): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop() || "bin";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Supabase storage upload notice:", uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn("Error uploading to Supabase storage:", err);
    return null;
  }
}

export interface SupabasePost {
  id?: number;
  username: string;
  user_avatar?: string;
  media_url: string;
  media_type: "image" | "video";
  kind?: "post" | "reel" | "story";
  caption?: string;
  likes?: number;
  location?: string;
  audio_track?: string;
  created_at?: string;
}

/**
 * Fetch all posts/reels from Supabase database `posts` table
 */
export async function fetchPostsFromSupabase(): Promise<SupabasePost[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch posts warning:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase fetch posts error:", err);
    return [];
  }
}

/**
 * Insert a post, reel, or story record into Supabase `posts` table
 */
export async function insertPostToSupabase(post: SupabasePost): Promise<SupabasePost | null> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          username: post.username,
          user_avatar: post.user_avatar,
          media_url: post.media_url,
          media_type: post.media_type,
          kind: post.kind || "post",
          caption: post.caption || "",
          likes: post.likes || 0,
          location: post.location || "",
          audio_track: post.audio_track || "",
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn("Supabase insert post notice:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase insert post error:", err);
    return null;
  }
}

export interface SupabaseProfile {
  id?: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  followers?: number;
  following?: number;
  updated_at?: string;
}

/**
 * Fetch user profile from Supabase `profiles` table
 */
export async function fetchProfileFromSupabase(username: string): Promise<SupabaseProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.warn("Supabase fetch profile warning:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase fetch profile error:", err);
    return null;
  }
}

/**
 * Upsert profile in Supabase `profiles` table
 */
export async function upsertProfileToSupabase(profile: SupabaseProfile): Promise<boolean> {
  try {
    const { error } = await supabase.from("profiles").upsert(
      {
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        followers: profile.followers,
        following: profile.following,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "username" },
    );

    if (error) {
      console.warn("Supabase upsert profile notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase upsert profile error:", err);
    return false;
  }
}

/**
 * Sync follow or unfollow state in Supabase `follows` / `profiles` table
 */
export async function toggleFollowInSupabase(
  followerUsername: string,
  followingUsername: string,
  isFollowing: boolean,
): Promise<boolean> {
  try {
    if (isFollowing) {
      // Insert follow relation
      const { error } = await supabase.from("follows").upsert(
        {
          follower: followerUsername,
          following: followingUsername,
          created_at: new Date().toISOString(),
        },
        { onConflict: "follower,following" },
      );
      if (error) console.warn("Supabase follow upsert notice:", error.message);
    } else {
      // Remove follow relation
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower", followerUsername)
        .eq("following", followingUsername);
      if (error) console.warn("Supabase follow delete notice:", error.message);
    }
    return true;
  } catch (err) {
    console.warn("Supabase toggle follow error:", err);
    return false;
  }
}

/**
 * Subscribe to real-time additions or updates on the `posts` table
 */
export function subscribeToPosts(onNewPost: (post: SupabasePost) => void) {
  try {
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          if (payload.new) {
            onNewPost(payload.new as SupabasePost);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Supabase subscription setup warning:", err);
    return () => {};
  }
}
