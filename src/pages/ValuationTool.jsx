import React, { useState } from "react";
import { Search, Rocket, Music, Youtube, Database } from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import ArtistCard from "../components/ui/ArtistCard";
import Badge from "../components/common/Badge";
import { usePageTitle } from "../hooks/usePageTitle";
import { searchSpotify, searchYouTube, searchApify } from "../utils/api";

const ValuationTool = () => {
  usePageTitle("Valuation Tool", "Analyze artist metrics with real-time data");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [platform, setPlatform] = useState("spotify"); // spotify | youtube | apify

  const suggestedArtists = [
    "Taylor Swift",
    "Drake",
    "The Weeknd",
    "Bad Bunny",
    "Ariana Grande",
  ];

  const mockArtistData = {
    name: "Taylor Swift",
    image: null,
    followers: "149.5M",
    popularity: "100/100",
    genres: ["pop", "country pop"], // New
    topTracks: [
      {
        title: "The Fate of Ophelia",
        publishYear: "2024",
        preview_url: "https://example.com/preview.mp3",
      },
      { title: "Blank Space", publishYear: "2014", preview_url: null },
      {
        title: "Shake It Off",
        publishYear: "2014",
        preview_url: "https://example.com/preview2.mp3",
      },
    ],
  };

  const PLATFORM_CONFIG = {
    spotify: {
      label: "Spotify",
      icon: Music,
      placeholder: "Search artist on Spotify...",
    },
    youtube: {
      label: "YouTube",
      icon: Youtube,
      placeholder: "Search channel or artist on YouTube...",
    },
    apify: {
      label: "Apify",
      icon: Database,
      placeholder: "Search using Apify scraper...",
    },
  };

  const SelectedIcon = PLATFORM_CONFIG[platform].icon;

  // --- SEARCH HANDLER ---
  // const handleSearch = async () => {
  //   if (!searchQuery.trim()) return;

  //   try {
  //     let result;

  //     switch (platform) {
  //       case 'spotify':
  //         result = await searchSpotify(searchQuery);
  //         break;

  //       case 'youtube':
  //         const ytData = await searchYouTube(searchQuery);
  //         const items = ytData.items || [];

  //         // Normalize top 5 videos
  //         const topVideos = items.slice(0, 5).map(item => ({
  //           videoId: item.id.videoId,
  //           title: item.snippet.title,
  //           thumbnail: item.snippet.thumbnails.high?.url || null
  //         }));

  //         const firstItem = items[0];
  //         result = {
  //           name: firstItem?.snippet?.channelTitle || searchQuery,
  //           image: firstItem?.snippet?.thumbnails?.high?.url || null,
  //           followers: 'N/A',
  //           popularity: 'N/A',
  //           topTracks: topVideos
  //         };
  //         break;

  //       case 'apify':
  //         result = await searchApify(searchQuery);
  //         break;

  //       default:
  //         result = null;
  //     }

  //     setSelectedArtist(result);
  //   } catch (err) {
  //     console.error('API error:', err);
  //     alert('Failed to fetch data. Check console for details.');
  //   }
  // };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      let result;

      switch (platform) {
        case "spotify":
          result = await searchSpotify(searchQuery);
          break;

        case "youtube":
          result = await searchYouTube(searchQuery);
          // YouTube Edge Function already returns normalized response
          result = {
            name: result.name || searchQuery,
            image: result.image || null,
            followers: result.followers || "N/A",
            popularity: result.popularity || "N/A",
            topTracks: result.topTracks || [],
          };
          break;

        case "apify":
          result = await searchApify(searchQuery);
          break;
      }

      setSelectedArtist(result);
    } catch (err) {
      console.error("API error:", err);
      alert("Failed to fetch data. Check console for details.");
    }
  };

  const handleLaunchValuation = () => {
    console.log(
      "Launching valuation for:",
      selectedArtist?.name,
      "on",
      platform
    );
  };

  return (
    <div className="space-y-6">
      {/* --- Search Section --- */}
      <Card className="bg-gradient-to-br from-emerald-500 to-blue-600 dark:from-emerald-600 dark:to-blue-700 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <SelectedIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Search Artist</h2>
            <p className="text-white/90 text-sm">
              Search from Spotify, YouTube or Apify
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none"
          >
            <option value="spotify" className="text-black">
              Spotify
            </option>
            <option value="youtube" className="text-black">
              YouTube
            </option>
            <option value="apify" className="text-black">
              Apify
            </option>
          </select>

          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder={PLATFORM_CONFIG[platform].placeholder}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <SelectedIcon size={20} className="text-white/70" />
            </div>
          </div>

          <Button
            variant="primary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            icon={SelectedIcon}
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

        {/* Suggested Artists */}
        <div className="mt-6">
          <p className="text-sm text-white/90 mb-3">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedArtists.map((artist) => (
              <button
                key={artist}
                onClick={() => {
                  setSearchQuery(artist);
                  setSelectedArtist({
                    ...mockArtistData,
                    name: `${artist} (${PLATFORM_CONFIG[platform].label})`,
                    // Override with real data if searching, but for mock it's fine
                  });
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium transition-all duration-200"
              >
                {artist}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* --- Artist Analysis --- */}
      {selectedArtist && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <SelectedIcon
                  size={24}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Live {PLATFORM_CONFIG[platform].label} Analysis
              </h2>
            </div>

            <Button icon={Rocket} onClick={handleLaunchValuation}>
              Launch Valuation
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" size="lg">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Real-time Data from {PLATFORM_CONFIG[platform].label}
            </span>
          </div>

          <ArtistCard
            name={selectedArtist.name}
            image={selectedArtist.image}
            followers={selectedArtist.followers}
            popularity={selectedArtist.popularity}
            topTracks={selectedArtist.topTracks}
            onLaunchValuation={handleLaunchValuation}
          />
        </div>
      )}

      {/* --- Empty State --- */}
      {!selectedArtist && (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full">
              <Search size={48} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Artist Selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select a platform and search for an artist
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ValuationTool;
