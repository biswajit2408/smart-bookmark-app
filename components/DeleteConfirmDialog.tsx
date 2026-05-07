'use client'

import { X, Trash2, Loader2 } from 'lucide-react'

interface Props {
  isOpen: boolean; onClose: () => void; onConfirm: () => void
  isDeleting: boolean; bookmarkTitle: string
}

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, isDeleting, bookmarkTitle }: Props) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">Delete Bookmark</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Remove <span className="font-medium text-gray-700">"{bookmarkTitle}"</span>? This action cannot be undone.
            </p>
          </div>
          <button onClick={onClose} disabled={isDeleting}
            className="text-gray-300 hover:text-gray-600 flex-shrink-0 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
            {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
