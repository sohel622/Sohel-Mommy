# Insta Pixel Perfect

Act as an expert Full-Stack React & Tailwind Developer. Build a complete, fully functional, production-ready Instagram Web Application based on the provided single-file HTML code and the attached screenshot.

Please preserve all UI designs, color palettes, micro-interactions, features, and state logic from the provided code, while refactoring it into a clean React + Vite + Tailwind CSS project structure.

### Key Requirements & Features:

1. Design & Aesthetic (Pixel-Perfect Match):

   - Dark mode aesthetic (`bg-slate-950`, glassmorphic cards, slate-900 border details).

   - Exact Instagram typography, brand icons, and gradient story rings (`#f09433` -> `#bc1888`).

   - Mobile-first layout with desktop-responsive sidebar and right-hand suggestion panels.

2. Navigation & Views (5-Tab Architecture):

   - Home Feed View: Top app header, horizontal scrolling Stories carousel, and rich feed cards.

   - Search View: Clean search input for searching users/creators with empty placeholder state and real-time result filtering.

   - Reels Viewport: Full-screen vertical scrolling reels with custom seekable video progress bar, audio info, like animations, and double-tap heart pop effects.

   - Direct Messages View: Dynamic chat listing and interactive UI.

   - Bilibili-Style Profile View: Cover photo banner, profile picture with camera edit badge, UID copy button, location badge, and 3 content tabs (Posts, Videos, Playlists).

   - Dedicated Account / Edit Profile View & Settings Modal.

3. Interactivity & Functionality:

   - Double-Tap Heart Pop animation on media posts and reels.

   - Universal Media Lightbox overlay with custom progress indicators and background video pausing.

   - Fully interactive Like, Bookmark, Follow/Unfollow, and Comment features.

   - Media Upload Engine: Modal for previewing images/videos with caption, location, and category selection (Post, Reel, Story).

   - IndexedDB & LocalStorage persistence for user profile, uploads, and media.

   - Simulated AI Moderation Engine for flagging restricted content and triggering the suspension screen if triggered.

4. Architecture & Code Structure:

   - Convert into modular React components (e.g., `Header`, `Stories`, `FeedPost`, `ReelsViewer`, `ProfileView`, `Lightbox`, `BottomNav`, `Sidebar`).

   - Use Lucide-React or FontAwesome icons seamlessly.

   - Ensure all video components handle mute/unmute, autoplay, and video progress smoothly.

Build this exact app retaining all features, exact styling, and full responsiveness as shown in the prov

ided source code and screenshot.

<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Instagram Clone - Safety & Profile Navigation Edition</title>

  <!-- Tailwind CSS CDN -->

  <script src="https://cdn.tailwindcss.com"></script>

  <!-- FontAwesome Icons CDN -->

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <!-- Google Fonts for Instagram Typography -->

  <link href="https://fonts.googleapis.com/css2?family=Grand+Hotel&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <style>

    body {

      font-family: 'Plus Jakarta Sans', sans-serif;

      background-color: #0f172a;

      color: #f8fafc;

      touch-action: pan-y;

    }

    .font-logo {

      font-family: 'Grand Hotel', cursive;

    }

    /* Custom Scrollbar Removal */

    .no-scrollbar::-webkit-scrollbar {

      display: none;

    }

    .no-scrollbar {

      -ms-overflow-style: none;

      scrollbar-width: none;

    }

    /* Double Tap Heart Pop Animation */

    @keyframes heartPop {

      0% { transform: translate(-50%, -50%) scale(0) rotate(-15deg); opacity: 0; }

      50% { transform: translate(-50%, -50%) scale(1.3) rotate(0deg); opacity: 1; }

      100% { transform: translate(-50%, -50%) scale(0.8) rotate(10deg); opacity: 0; }

    }

    .animate-heart-pop {

      animation: heartPop 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;

    }

    /* Slide up animation for bottom sheet */

    @keyframes slideUp {

      from { transform: translateY(100%); opacity: 0; }

      to { transform: translateY(0); opacity: 1; }

    }

    .animate-slide-up {

      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;

    }

    /* Gradient Ring for Unseen Stories */

    .story-ring {

      background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);

    }

    .glass-card {

      background: rgba(30, 41, 59, 0.7);

      backdrop-filter: blur(16px);

      -webkit-backdrop-filter: blur(16px);

      border: 1px solid rgba(255, 255, 255, 0.08);

    }

    .glass-nav {

      background: rgba(15, 23, 42, 0.85);

      backdrop-filter: blur(20px);

      -webkit-backdrop-filter: blur(20px);

      border-color: rgba(255, 255, 255, 0.1);

    }

  </style>

</head>

<body class="bg-slate-950 text-slate-100 h-screen overflow-hidden md:overflow-visible selection:bg-pink-500 selection:text-white">

  <!-- GLOBAL HIDDEN FILE INPUTS FOR UPLOADS -->

  <input type="file" id="global-file-input" accept="image/*,video/*" class="hidden" onchange="handleFileSelect(event)">

  <input type="file" id="cover-file-input" accept="image/*" class="hidden" onchange="handleCoverSelect(event)">

  <input type="file" id="avatar-file-input" accept="image/*" class="hidden" onchange="handleAvatarFileSelect(event)">

  <input type="file" id="camera-file-input" accept="image/*" capture="user" class="hidden" onchange="handleAvatarFileSelect(event)">

  <!-- FULL-SCREEN AUTHENTICATION SHEET (`#view-auth`) -->

  <div id="view-auth" class="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[90] hidden flex-col items-center justify-center p-6 text-slate-100">

    <div class="glass-card max-w-sm w-full p-8 rounded-3xl space-y-6 shadow-2xl border border-slate-800 text-center">

      <!-- App Logo -->

      <h1 class="font-logo text-5xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent cursor-pointer">Instagram</h1>



      <!-- Headers -->

      <div class="space-y-1">

        <h2 class="text-xl font-bold text-slate-100">Log in to Instagram</h2>

        <p class="text-xs text-slate-400">Log in and explore, enjoy higher quality.</p>

      </div>



      <!-- Login Buttons -->

      <div class="space-y-3 pt-2">

        <!-- Continue with Google -->

        <button onclick="handleLogin('Google')" class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl flex items-center justify-center space-x-3 font-semibold text-sm transition shadow-md hover:border-slate-600">

          <svg class="w-5 h-5" viewBox="0 0 24 24">

            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>

            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>

            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>

            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>

          </svg>

          <span>Continue with Google</span>

        </button>



        <!-- Continue with Email -->

        <button onclick="handleLogin('Email')" class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl flex items-center justify-center space-x-3 font-semibold text-sm transition shadow-md hover:border-slate-600">

          <i class="fa-regular fa-envelope text-pink-400 text-lg"></i>

          <span>Continue with Email</span>

        </button>

      </div>



      <!-- Terms and Privacy Checkbox -->

      <div class="flex items-start space-x-2.5 pt-2 text-left">

        <input type="checkbox" id="terms-checkbox" class="mt-0.5 rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-pink-500 cursor-pointer" checked>

        <label for="terms-checkbox" class="text-[11px] text-slate-400 leading-tight cursor-pointer select-none">

          I have read and agree to <a href="#" onclick="event.preventDefault(); showToast('Terms of Service')" class="text-pink-400 hover:underline">Terms of Service</a> and <a href="#" onclick="event.preventDefault(); showToast('Privacy Policy')" class="text-pink-400 hover:underline">Privacy Policy</a>

        </label>

      </div>

    </div>

  </div>

  <!-- APP CONTAINER -->

  <div id="app-core" class="flex flex-col md:flex-row h-screen md:min-h-screen max-w-[1440px] mx-auto relative overflow-hidden md:overflow-visible">

    <!-- DESKTOP SIDEBAR NAVIGATION -->

    <aside id="desktop-sidebar" class="hidden md:flex flex-col justify-between w-20 xl:w-64 border-r border-slate-800 bg-slate-900/90 backdrop-blur-xl h-screen sticky top-0 p-4 z-40">

      <div class="space-y-6">

        <!-- Logo -->

        <div class="px-3 pt-3">

          <h1 class="font-logo text-4xl hidden xl:block cursor-pointer bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent hover:opacity-90 transition" onclick="switchView('feed')">Instagram</h1>

          <i class="fa-brands fa-instagram text-3xl xl:hidden cursor-pointer text-pink-500 hover:scale-110 transition" onclick="switchView('feed')"></i>

        </div>



        <!-- Navigation Links -->

        <nav class="space-y-2">

          <button onclick="switchView('feed')" id="nav-feed-btn" class="flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 font-semibold transition text-slate-200">

            <i class="fa-solid fa-house text-xl"></i>

            <span class="hidden xl:inline text-base">Home</span>

          </button>

          <button onclick="switchView('search')" id="sidebar-search-btn" class="flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 transition">

            <i class="fa-solid fa-magnifying-glass text-xl"></i>

            <span class="hidden xl:inline text-base">Search</span>

          </button>

          <button onclick="switchView('search')" id="sidebar-explore-btn" class="flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 transition">

            <i class="fa-regular fa-compass text-xl"></i>

            <span class="hidden xl:inline text-base">Explore</span>

          </button>

          <button onclick="switchView('reels')" id="nav-reels-btn" class="flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 transition">

            <i class="fa-solid fa-film text-xl"></i>

            <span class="hidden xl:inline text-base">Reels</span>

          </button>

          <button onclick="switchView('chats')" id="nav-chats-btn" class="flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 transition">

            <i class="fa-regular fa-paper-plane text-xl"></i>

            <span class="hidden xl:inline text-base">Messages</span>

          </button>

          <button onclick="showToast('No new notifications')" class="flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 transition">

            <i class="fa-regular fa-heart text-xl"></i>

            <span class="hidden xl:inline text-base">Notifications</span>

          </button>

          <button onclick="triggerFileUpload()" class="flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 transition">

            <i class="fa-regular fa-square-plus text-xl"></i>

            <span class="hidden xl:inline text-base">Create</span>

          </button>

          <button onclick="switchView('profile')" id="nav-profile-btn" class="flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 transition">

            <img id="sidebar-user-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" onerror="handleImageError(this, 'avatar')" class="w-7 h-7 rounded-full object-cover ring-2 ring-slate-700" alt="Avatar">

            <span class="hidden xl:inline text-base">Profile</span>

          </button>

        </nav>

      </div>



      <!-- More Options -->

      <button onclick="openSettingsModal()" class="flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 transition">

        <i class="fa-solid fa-bars text-xl"></i>

        <span class="hidden xl:inline text-base">More</span>

      </button>

    </aside>



    <!-- MOBILE TOP HEADER (`#app-header` / `#global-header`) -->

    <header id="global-header" class="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800/80 glass-nav fixed top-0 left-0 right-0 z-30 transition-transform duration-300 transform translate-y-0">

      <h1 class="font-logo text-3xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent cursor-pointer" onclick="switchView('feed')">Instagram</h1>

      <div class="flex items-center space-x-5 text-xl text-slate-200">

        <button onclick="triggerFileUpload()" class="hover:text-pink-500 transition"><i class="fa-regular fa-square-plus"></i></button>

        <button onclick="showToast('No new notifications')" class="hover:text-pink-500 transition"><i class="fa-regular fa-heart"></i></button>

        <button onclick="switchView('chats')" class="hover:text-pink-500 transition"><i class="fa-regular fa-paper-plane"></i></button>

      </div>

    </header>



    <!-- MAIN SCROLLABLE CONTAINER (TOUCH GESTURE TARGET) -->

    <main id="main-viewport" class="flex-1 overflow-y-auto h-screen flex justify-center pt-16 md:pt-8 pb-16 md:pb-0 px-0 md:px-6 w-full no-scrollbar select-none">



      <!-- VIEW 1: HOME FEED VIEW (`#feed-view` / `#view-home`) -->

      <section id="feed-view" class="w-full max-w-[630px] space-y-5">

        <!-- Stories Carousel -->

        <div class="glass-card rounded-none md:rounded-2xl p-4 flex space-x-4 overflow-x-auto no-scrollbar" id="stories-container">

          <!-- Rendered dynamically -->

        </div>



        <!-- Feed Posts Container -->

        <div id="posts-container" class="space-y-6">

          <!-- Rendered dynamically -->

        </div>

      </section>



      <!-- VIEW 2: FULL-SCREEN IMMERSIVE REELS VIEWPORT -->

      <section id="view-reels" class="hidden w-full h-[100dvh] md:h-[calc(100vh-48px)] max-w-[420px] mx-auto snap-y snap-mandatory overflow-y-auto no-scrollbar rounded-none md:rounded-3xl border-0 md:border border-slate-800 bg-black relative shadow-2xl">

        <div id="reels-container" class="w-full h-full">

          <!-- Rendered dynamically -->

        </div>

      </section>



      <!-- VIEW 3: CHATS / MESSAGES VIEW -->

      <section id="view-chats" class="hidden w-full max-w-[630px] glass-card rounded-none md:rounded-2xl overflow-hidden min-h-[550px] shadow-xl">

        <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">

          <h2 class="font-bold text-lg flex items-center gap-2 text-slate-100">

            <span>alex_developer</span>

            <i class="fa-solid fa-chevron-down text-xs text-slate-400"></i>

          </h2>

          <button onclick="showToast('New Direct Message')" class="text-xl text-slate-300 hover:text-white transition"><i class="fa-regular fa-pen-to-square"></i></button>

        </div>

        <div class="p-4 space-y-3" id="chats-list-container">

          <!-- Rendered dynamically -->

        </div>

      </section>



      <!-- VIEW 6: SEARCH PAGE VIEW (`#view-search`) - CLEAN EMPTY STATE -->

      <section id="view-search" class="hidden w-full max-w-[935px] px-3 sm:px-4 py-2 space-y-4 min-h-screen bg-slate-950 text-white z-40">

        <!-- Sticky Top Search Bar (Search User | Video | Creator) -->

        <div class="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md pb-3 pt-1 border-b border-slate-800/80">

          <div class="relative flex items-center w-full">

            <i class="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 text-sm"></i>

            <input type="text" id="user-search-input" oninput="handleSearchInput(event)" placeholder="Search User | Video | Creator" class="w-full pl-11 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-full text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition">

            <button id="clear-search-btn" onclick="clearSearchInput()" class="hidden absolute right-3 text-slate-400 hover:text-slate-100 transition p-1">

              <i class="fa-solid fa-circle-xmark text-base"></i>

            </button>

          </div>

        </div>



        <!-- Real-Time Search Results List -->

        <div id="search-results-list" class="hidden space-y-2.5">

          <!-- Rendered dynamically when user types -->

        </div>



        <!-- Clean Empty State Placeholder (No Auto-Play / No Pre-loaded Videos) -->

        <div id="search-empty-state" class="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-4">

          <div class="w-24 h-24 bg-slate-900 border border-slate-800/80 rounded-full flex items-center justify-center shadow-inner">

            <i class="fa-solid fa-box-open text-4xl text-slate-600"></i>

          </div>

          <div class="space-y-1">

            <h4 class="text-base font-semibold text-slate-400">No content</h4>

            <p class="text-xs text-slate-500 max-w-xs">Type in the search bar above to search for users, creators, or video IDs.</p>

          </div>

        </div>

      </section>



      <!-- RIGHT SIDEBAR (Desktop Suggestions) -->

      <aside class="hidden lg:block w-80 pl-8 py-2">

        <div class="flex items-center justify-between mb-6 glass-card p-3 rounded-2xl">

          <div class="flex items-center space-x-3 cursor-pointer" onclick="openUserProfile('Sohel Mommy')">

            <img id="right-sidebar-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" onerror="handleImageError(this, 'avatar')" class="w-11 h-11 rounded-full object-cover ring-2 ring-pink-500/50" alt="Profile">

            <div>

              <p class="font-semibold text-sm text-slate-100" id="right-sidebar-username">Sohel Mommy</p>

              <p class="text-xs text-slate-400" id="right-sidebar-name">Sohel Rivera</p>

            </div>

          </div>

          <button class="text-xs font-semibold text-sky-400 hover:text-sky-300 transition" onclick="switchView('profile')">Switch</button>

        </div>



        <div class="flex justify-between items-center mb-4 px-1">

          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggested for you</span>

          <button class="text-xs font-semibold text-slate-300 hover:text-white transition">See All</button>

        </div>



        <div class="space-y-3 glass-card p-4 rounded-2xl" id="suggestions-container">

          <!-- Rendered dynamically -->

        </div>



        <footer class="mt-8 text-xs text-slate-500 space-y-4 px-1">

          <p class="leading-relaxed">About • Help • Press • API • Jobs • Privacy • Terms • Locations • Language</p>

          <p class="font-medium text-slate-600">© 2026 INSTAGRAM CLONE - SAFETY & PROFILE NAV</p>

        </footer>

      </aside>



      <!-- VIEW 4: MODERN BILIBILI-STYLE PROFILE VIEW (`#view-profile` / `#profile-view`) -->

      <section id="profile-view" class="hidden w-full max-w-[935px] pb-24 space-y-4 relative">



        <!-- COVER PHOTO BANNER CONTAINER (FLUSH WITH VIEWPORT SAFE AREA) -->

        <div id="profile-cover-banner" class="w-full h-48 sm:h-56 relative bg-cover bg-center pt-[env(safe-area-inset-top,0px)] bg-slate-800 rounded-b-3xl overflow-visible shadow-lg transition-all cursor-pointer" style="background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');" onclick="openMediaLightbox(currentUser.coverPhoto, 'image', currentUser.avatar, currentUser.username, 'Cover Photo')">

          <!-- Absolute Top Controls -->

          <div class="absolute top-3 left-3 right-3 flex items-center justify-between z-20" onclick="event.stopPropagation()">

            <button onclick="switchView('feed')" class="p-2.5 bg-slate-950/60 backdrop-blur-md text-white rounded-full hover:bg-slate-900 transition shadow-md">

              <i class="fa-solid fa-arrow-left text-sm"></i>

            </button>

            <div class="flex items-center space-x-2">

              <button onclick="triggerCoverUpload()" title="Change Cover Photo" class="p-2.5 bg-slate-950/60 backdrop-blur-md text-white rounded-full hover:bg-slate-900 transition shadow-md">

                <i class="fa-regular fa-image text-sm"></i>

              </button>

              <button onclick="showToast('Profile link copied!')" title="Share" class="p-2.5 bg-slate-950/60 backdrop-blur-md text-white rounded-full hover:bg-slate-900 transition shadow-md">

                <i class="fa-solid fa-arrow-up-right-from-square text-sm"></i>

              </button>

            </div>

          </div>



          <!-- RESIZED COMPACT PROFILE AVATAR LOGO & CAMERA BADGE -->

          <div class="absolute -bottom-8 right-5 z-10 group cursor-pointer" onclick="event.stopPropagation()">

            <div class="relative">

              <img id="profile-page-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" onerror="handleImageError(this, 'avatar')" onclick="openMediaLightbox(currentUser.avatar, 'image', currentUser.avatar, currentUser.username, 'Profile Picture')" class="w-20 h-20 rounded-full border-4 border-black object-cover shadow-md" alt="Avatar">

              <div id="avatar-camera-btn" onclick="event.stopPropagation(); openAvatarPickerSheet()" class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-pink-500 border-2 border-black flex items-center justify-center text-white shadow-lg transition hover:bg-pink-600 z-20 cursor-pointer">

                <i class="fa-solid fa-camera text-xs"></i>

              </div>

            </div>

          </div>

        </div>

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixelgram-react.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ebc7beb7-d8a6-4aa5-a47a-3c2f96fdb62c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
