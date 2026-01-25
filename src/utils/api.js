// import { supabase } from './supabase'

// // Spotify
// export async function searchSpotify(query) {
//   const { data, error } = await supabase.functions.invoke('spotify', {
//     body: JSON.stringify({ query }),
//   })
//   if (error) throw error
//   return data
// }

// // YouTube
// export async function searchYouTube(query) {
//   const { data, error } = await supabase.functions.invoke('youtube', {
//     body: JSON.stringify({ query }),
//   })
//   if (error) throw error
//   return data
// }

// // Apify
// export async function searchApify(query) {
//   const { data, error } = await supabase.functions.invoke('apify', {
//     body: JSON.stringify({ query }),
//   })
//   if (error) throw error
//   return data
// }






import { supabase } from './supabase'

// Helper to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    Authorization: `Bearer ${session?.access_token || ''}`,
  }
}

// Spotify
export async function searchSpotify(query) {
  const headers = await getAuthHeaders()
  const { data, error } = await supabase.functions.invoke('spotify', {
    body: { query },
    headers,
  })
  if (error) throw error
  return data
}

// YouTube
export async function searchYouTube(query) {
  const headers = await getAuthHeaders()
  const { data, error } = await supabase.functions.invoke('youtube', {
    body: { query },
    headers,
  })
  if (error) throw error
  return data
}

// Apify
export async function searchApify(query) {
  const headers = await getAuthHeaders()
  const { data, error } = await supabase.functions.invoke('apify', {
    body: { query },
    headers,
  })
  if (error) throw error
  return data
}

// Fetch album images from Spotify by searching for albums
export async function getSpotifyAlbumImages(artistName, albumNames) {
  try {
    const headers = await getAuthHeaders()
    
    // Search for each album on Spotify
    const albumsData = await Promise.all(
      albumNames.map(async (albumName) => {
        try {
          const response = await searchSpotify(`${artistName} ${albumName}`)
          if (response?.albums?.[0]?.image) {
            return {
              albumName,
              image: response.albums[0].image,
            }
          }
          return { albumName, image: null }
        } catch (err) {
          console.warn(`Failed to fetch image for album: ${albumName}`, err)
          return { albumName, image: null }
        }
      })
    )
    
    return albumsData
  } catch (err) {
    console.warn('Failed to fetch Spotify album images:', err)
    return []
  }
}



// Add this new function to api.js
export async function getArtistSuggestions(query, platform = 'spotify') {
  try {
    if (!query.trim()) return []
    
    const headers = await getAuthHeaders()
    
    if (platform === 'spotify') {
      // Call Apify to get artist suggestions
      const { data, error } = await supabase.functions.invoke('apify', {
        body: { query },
        headers,
      })
      
      if (error) throw error
      
      // Return a simple object with the found artist
      // You can also return multiple matches if the API supports it
      if (data?.name) {
        return [{
          name: data.name,
          image: data.image,
          followers: data.followers
        }]
      }
      return []
    } else if (platform === 'youtube') {
      // Call YouTube to get channel suggestions
      const { data, error } = await supabase.functions.invoke('youtube', {
        body: { query },
        headers,
      })
      
      if (error) throw error
      
      if (data?.name) {
        return [{
          name: data.name,
          image: data.image,
          subscribers: data.subscribers
        }]
      }
      return []
    }
  } catch (err) {
    console.warn(`Failed to fetch suggestions for query: ${query}`, err)
    return []
  }
}



// Add this to api.js

// Cache for trending artists to avoid repeated API calls
let trendingArtistsCache = {
  spotify: [],
  youtube: [],
  lastFetch: {}
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get trending/popular artists for suggestions
export async function getTrendingArtists(platform = 'spotify') {
  try {
    const now = Date.now();
    
    // Return cached results if still fresh
    if (
      trendingArtistsCache[platform].length > 0 &&
      trendingArtistsCache.lastFetch[platform] &&
      now - trendingArtistsCache.lastFetch[platform] < CACHE_DURATION
    ) {
      return trendingArtistsCache[platform];
    }

    const headers = await getAuthHeaders();

    if (platform === 'spotify') {
      // Call your backend to get trending artists
      const { data, error } = await supabase.functions.invoke('apify-trending', {
        body: { limit: 100 }, // Get top 100 artists
        headers,
      });

      if (error) throw error;

      // Extract artist names from response
      const artists = (data?.artists || []).map(artist => ({
        name: artist.name,
        image: artist.image,
        followers: artist.followers
      }));

      trendingArtistsCache.spotify = artists;
      trendingArtistsCache.lastFetch.spotify = now;
      return artists;
    } else if (platform === 'youtube') {
      const { data, error } = await supabase.functions.invoke('youtube-trending', {
        body: { limit: 100 },
        headers,
      });

      if (error) throw error;

      const channels = (data?.channels || []).map(channel => ({
        name: channel.name,
        image: channel.image,
        subscribers: channel.subscribers
      }));

      trendingArtistsCache.youtube = channels;
      trendingArtistsCache.lastFetch.youtube = now;
      return channels;
    }
  } catch (err) {
    console.warn(`Failed to fetch trending ${platform} artists:`, err);
    return [];
  }
}

// Filter artists based on search query
export function filterArtistSuggestions(artists, query) {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();

  // Filter artists that start with the query
  const startsWith = artists.filter(artist =>
    artist.name.toLowerCase().startsWith(searchTerm)
  );

  // If we have results starting with query, return them sorted
  if (startsWith.length > 0) {
    return startsWith
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 10); // Limit to 10 results
  }

  // Otherwise, filter artists that contain the query
  const contains = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm)
  );

  return contains
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 10);
}