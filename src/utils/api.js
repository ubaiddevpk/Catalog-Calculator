import { supabase } from './supabase'

// Spotify
export async function searchSpotify(query) {
  const { data, error } = await supabase.functions.invoke('spotify', {
    body: JSON.stringify({ query }),
  })
  if (error) throw error
  return data
}

// YouTube
export async function searchYouTube(query) {
  const { data, error } = await supabase.functions.invoke('youtube', {
    body: JSON.stringify({ query }),
  })
  if (error) throw error
  return data
}

// Apify
export async function searchApify(query) {
  const { data, error } = await supabase.functions.invoke('apify', {
    body: JSON.stringify({ query }),
  })
  if (error) throw error
  return data
}
