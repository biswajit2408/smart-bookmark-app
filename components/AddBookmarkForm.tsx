'use client'

import { useState } from 'react'
import { createBookmark } from '@/app/actions/bookmarks'
import { Plus, X, Loader2 } from 'lucide-react'

export function AddBookmarkForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState('')

  const reset = () => { setTitle(''); setUrl(''); setDescription(''); setTags([]); setTagInput(''); setError('') }
  const handleClose = () => { setIsOpen(false); reset() }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 5) { setTags([...tags, t]); setTagInput('') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setIsSubmitting(true)
    try {
      await createBookmark({ title: title.trim(), url: url.trim(), tags, description: description.trim() || undefined })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setIsSubmitting(false) }
  }

  const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5"

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-7 right-7 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center z-30 hover:-translate-y-0.5 active:translate-y-0"
        aria-label="Add bookmark"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Add Bookmark</h2>
                <p className="text-xs text-gray-500 mt-0.5">Save a new link to your collection</p>
              </div>
              <button onClick={handleClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              <div>
                <label className={labelCls}>Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                  className={inputCls} placeholder="e.g. Next.js Documentation" />
              </div>

              <div>
                <label className={labelCls}>URL *</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} required
                  className={inputCls} placeholder="https://example.com" />
              </div>

              <div>
                <label className={labelCls}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  className={`${inputCls} resize-none`} placeholder="What's this link about?" />
              </div>

              <div>
                <label className={labelCls}>Tags <span className="text-gray-400 font-normal">(optional, up to 5)</span></label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    disabled={tags.length >= 5}
                    className={`${inputCls} flex-1`} placeholder="e.g. design, tools"
                  />
                  <button type="button" onClick={addTag} disabled={tags.length >= 5 || !tagInput.trim()}
                    className="px-4 py-2.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-200">
                        {tag}
                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}
                          className="hover:text-indigo-900 transition-colors ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || !title.trim() || !url.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save Bookmark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
