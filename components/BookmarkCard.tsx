'use client'

import { useState } from 'react'
import { deleteBookmark } from '@/app/actions/bookmarks'
import type { Bookmark } from '@/types/database'
import { ExternalLink, Trash2 } from 'lucide-react'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

interface BookmarkCardProps { bookmark: Bookmark }

const TAG_COLORS: Record<number, string> = {
  0: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  1: 'bg-violet-50 text-violet-700 border-violet-200',
  2: 'bg-sky-50 text-sky-700 border-sky-200',
  3: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  4: 'bg-amber-50 text-amber-700 border-amber-200',
  5: 'bg-rose-50 text-rose-700 border-rose-200',
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try { await deleteBookmark(bookmark.id); setShowDelete(false) }
    catch { alert('Failed to delete. Please try again.') }
    finally { setIsDeleting(false) }
  }

  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace('www.', '') } catch { return url }
  }

  const tagColor = (tag: string) =>
    TAG_COLORS[tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 6]

  return (
    <>
      <div className="group bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md rounded-xl p-4 flex flex-col gap-3 transition-all duration-150">

        {/* Top row: favicon + title + delete */}
        <div className="flex items-start gap-3">
          <img
            src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=32`}
            alt=""
            width={20} height={20}
            className="rounded mt-0.5 flex-shrink-0"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">{bookmark.title}</h3>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors mt-0.5 max-w-full"
            >
              <span className="truncate">{getDomain(bookmark.url)}</span>
              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
            </a>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Delete bookmark"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Description */}
        {bookmark.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{bookmark.description}</p>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bookmark.tags.map(tag => (
              <span key={tag} className={`px-2 py-0.5 text-xs font-medium rounded border ${tagColor(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Date */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Saved {new Date(bookmark.created_at).toLocaleDateString('en-GB')}
          </span>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        bookmarkTitle={bookmark.title}
      />
    </>
  )
}
