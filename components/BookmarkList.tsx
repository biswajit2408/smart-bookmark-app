'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Bookmark } from '@/types/database'
import { BookmarkCard } from './BookmarkCard'
import { Search, BookmarkX } from 'lucide-react'

interface BookmarkListProps {
  initialBookmarks: Bookmark[]
}

export function BookmarkList({ initialBookmarks }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('bookmarks_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, (payload) => {
        if (payload.eventType === 'INSERT') setBookmarks(cur => [payload.new as Bookmark, ...cur])
        else if (payload.eventType === 'DELETE') setBookmarks(cur => cur.filter(b => b.id !== payload.old.id))
        else if (payload.eventType === 'UPDATE') setBookmarks(cur => cur.map(b => b.id === payload.new.id ? payload.new as Bookmark : b))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags))).sort()

  const filtered = bookmarks
    .filter(b => !selectedTag || b.tags.includes(selectedTag))
    .filter(b => {
      const q = search.trim().toLowerCase()
      return !q || b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q)
    })

  /* ── Empty state ── */
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <BookmarkX className="w-7 h-7 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">No bookmarks yet</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Click the <span className="font-semibold text-indigo-600">+</span> button in the bottom-right corner to save your first link.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookmarks…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedTag === null
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              All ({bookmarks.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {tag} ({bookmarks.filter(b => b.tags.includes(tag)).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(bookmark => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No bookmarks match your search.</p>
        </div>
      )}
    </div>
  )
}
