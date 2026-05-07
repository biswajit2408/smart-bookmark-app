import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookmarkList } from '@/components/BookmarkList'
import { AddBookmarkForm } from '@/components/AddBookmarkForm'
import { signOut } from '@/app/actions/auth'
import { Bookmark, LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  const avatarUrl = user.user_metadata?.avatar_url
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const count = bookmarks?.length || 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Smart Bookmarks</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {name[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-700 max-w-[150px] truncate">{name}</span>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg font-medium transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Page title bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-xl font-bold text-gray-900">My Bookmarks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {count === 0 ? 'No bookmarks yet — add your first one below' : `${count} saved link${count !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-28">
        <BookmarkList initialBookmarks={bookmarks || []} />
      </main>

      <AddBookmarkForm />
    </div>
  )
}
