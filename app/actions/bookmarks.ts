'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type BookmarkInsert = Database['public']['Tables']['bookmarks']['Insert']

export async function createBookmark(formData: {
  title: string
  url: string
  tags?: string[]
  description?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate URL
  try {
    new URL(formData.url)
  } catch {
    throw new Error('Invalid URL')
  }

  const bookmarkData: BookmarkInsert = {
    user_id: user.id,
    title: formData.title.trim(),
    url: formData.url.trim(),
    tags: formData.tags || [],
    description: formData.description?.trim() || null,
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert(bookmarkData)
    .select()
    .single()

  if (error) {
    throw error
  }

  revalidatePath('/dashboard')
  return data
}

export async function deleteBookmark(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only delete their own bookmarks

  if (error) {
    throw error
  }

  revalidatePath('/dashboard')
}

export async function updateBookmark(
  id: string,
  updates: {
    title?: string
    url?: string
    tags?: string[]
    description?: string
  }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate URL if being updated
  if (updates.url) {
    try {
      new URL(updates.url)
    } catch {
      throw new Error('Invalid URL')
    }
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only update their own bookmarks
    .select()
    .single()

  if (error) {
    throw error
  }

  revalidatePath('/dashboard')
  return data
}
