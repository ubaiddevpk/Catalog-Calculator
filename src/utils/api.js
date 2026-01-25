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