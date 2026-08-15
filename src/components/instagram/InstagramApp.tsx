import { useEffect, useRef } from "react";
import { AppProvider, useApp, LanguageProvider } from "@/lib/instagram/context";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";
import { FeedView } from "./FeedView";
import { SearchView } from "./SearchView";
import { ReelsView } from "./ReelsView";
import { ChatsView } from "./ChatsView";
import { ProfileView } from "./ProfileView";
import { AccountView } from "./AccountView";
import { Lightbox } from "./Lightbox";
import { UploadModal } from "./UploadModal";
import { CreatePostModal } from "./CreatePostModal";
import { SettingsModal } from "./SettingsModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { BannedScreen } from "./BannedScreen";
import { StoryViewer } from "./StoryViewer";
import { Toast } from "./Toast";
import { CommentSheet } from "./CommentSheet";
import { ShareSheet } from "./ShareSheet";
import { MediaOptionsSheet } from "./MediaOptionsSheet";
import { SavedSheet } from "./SavedSheet";
import { PeekPreview } from "./PeekPreview";
import { SaveCollectionSheet } from "./SaveCollectionSheet";
import { ReelsInsightsModal } from "./ReelsInsightsModal";
import { LoginView } from "./LoginView";
import { WelcomeView } from "./WelcomeView";
import { OnboardingView } from "./OnboardingView";
import { UserProfileView } from "./UserProfileView";
import { SavedPostsView } from "./SavedPostsView";
import { HelpSupportView } from "./HelpSupportView";
import { SoundDetailsView } from "./SoundDetailsView";

function Shell() {
  const { view, lightbox, theme, authed, showLogin, needsOnboarding } = useApp();
  const onReels = view === "reels";
  const lastYRef = useRef(0);
  const hiddenRef = useRef(false);
  // The top header belongs to the Home Feed only.
  const showHeader = view === "feed";

  // Reels force a pure-black immersive theme and sync the Android status/nav bars.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reels-active", onReels);
    const color = onReels || theme === "dark" ? "#000000" : "#ffffff";
    const ensure = (name: string) => {
      let m = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!m) {
        m = document.createElement("meta");
        m.name = name;
        document.head.appendChild(m);
      }
      return m;
    };
    ensure("theme-color").content = color;
    ensure("apple-mobile-web-app-status-bar-style").content =
      onReels || theme === "dark" ? "black-translucent" : "default";
    return () => root.classList.remove("reels-active");
  }, [onReels, theme]);

  // Keep global audio alive when the tab/app is backgrounded and restored.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      document.querySelectorAll("video").forEach((v) => {
        if (v.dataset["autoplayVisible"] === "false") return;
        const r = v.getBoundingClientRect();
        const onScreen = r.top < window.innerHeight && r.bottom > 0 && r.width > 0;
        if (onScreen && v.paused) void v.play().catch(() => undefined);
      });
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  useEffect(() => {
    // Auto-hide on scroll only applies where the header actually exists.
    const immersive = !showHeader || lightbox.open;
    const header = document.getElementById("global-header");
    const nav = document.getElementById("bottom-nav");

    const show = () => {
      hiddenRef.current = false;
      header?.classList.remove("-translate-y-full");
      nav?.classList.remove("translate-y-full");
    };
    const hide = () => {
      hiddenRef.current = true;
      header?.classList.add("-translate-y-full");
      nav?.classList.add("translate-y-full");
    };

    if (immersive) {
      show();
      return;
    }

    show();
    // The feed is its own scroll container, so window.scrollY never moves.
    const scroller = document.getElementById("feed-scroll");
    const readY = () => (scroller ? scroller.scrollTop : window.scrollY);
    lastYRef.current = readY();

    const onScroll = () => {
      const y = readY();
      const dy = y - lastYRef.current;
      if (Math.abs(dy) < 6) return;
      if (y <= 4) {
        show();
      } else if (dy > 0 && y > 60) {
        if (!hiddenRef.current) hide();
      } else if (dy < 0) {
        if (hiddenRef.current) show();
      }
      lastYRef.current = y;
    };

    const target: EventTarget = scroller ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      show();
    };
  }, [showHeader, lightbox.open, view]);

  return (
    <div
      className={`flex flex-col md:flex-row w-full min-w-0 max-w-full md:max-w-[1440px] mx-auto relative min-h-[100dvh] overflow-x-hidden ${
        onReels ? "bg-black" : "bg-white dark:bg-black"
      }`}
    >
      <Sidebar />
      {showHeader && <MobileHeader />}

      <main
        id="main-viewport"
        className={`flex-1 min-w-0 w-full max-w-full min-h-[100dvh] md:pt-6 pb-12 md:pb-6 px-0 md:px-6 overflow-x-hidden touch-pan-y ${
          showHeader ? "pt-12" : "pt-0"
        }`}
        style={{ touchAction: "pan-y" }}
      >
        {view === "feed" && <FeedView />}
        {view === "search" && <SearchView />}
        {view === "reels" && <ReelsView />}
        {view === "chats" && <ChatsView />}
        {view === "profile" && <ProfileView />}
        {view === "account" && <AccountView />}
        {view === "user-profile" && <UserProfileView />}
        {view === "saved-posts" && <SavedPostsView />}
        {view === "help-support" && <HelpSupportView />}
        {view === "sound-details" && <SoundDetailsView />}
      </main>

      <BottomNav />

      <Lightbox />
      <UploadModal />
      <CreatePostModal />
      <SettingsModal />
      <DeleteAccountModal />
      <StoryViewer />
      <BannedScreen />
      <Toast />
      <CommentSheet />
      <ShareSheet />
      <MediaOptionsSheet />
      <SavedSheet />
      <PeekPreview />
      <SaveCollectionSheet />
      <ReelsInsightsModal />

      {!authed && (!showLogin ? <WelcomeView /> : <LoginView />)}
      {authed && needsOnboarding && <OnboardingView />}
    </div>
  );
}

export function InstagramApp() {
  return (
    <LanguageProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </LanguageProvider>
  );
}
