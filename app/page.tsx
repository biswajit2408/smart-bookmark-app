import { signInWithGoogle } from '@/app/actions/auth'
import { Bookmark, Zap, Shield, Tag } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl mx-auto">

          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-200">
              <Bookmark className="w-7 h-7 text-white" fill="white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Smart Bookmark Manager</h1>
            <p className="text-gray-500 text-base max-w-md leading-relaxed">
              Save, tag, and organize your links with real-time sync across all tabs — all private to you.
            </p>
          </div>

          {/* Sign in card */}
          <div className="flex justify-center mb-12">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
              <p className="text-sm font-medium text-gray-700 text-center mb-5">Sign in to get started</p>
              <form action={signInWithGoogle}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:shadow-md text-gray-800 font-semibold rounded-xl transition-all duration-150 text-sm"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>
              <p className="text-center text-xs text-gray-400 mt-4">No password required · Google OAuth 2.0</p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: Zap,    label: 'Real-Time Sync',  desc: 'Bookmarks update instantly across all open tabs.',         iconCls: 'text-amber-500',   bgCls: 'bg-amber-50'   },
              { icon: Tag,    label: 'Tags & Filters',  desc: 'Organize with tags and filter your list in one click.',    iconCls: 'text-indigo-500',  bgCls: 'bg-indigo-50'  },
              { icon: Shield, label: 'Fully Private',   desc: 'Your bookmarks are only visible to you — always.',        iconCls: 'text-emerald-500', bgCls: 'bg-emerald-50' },
            ].map(({ icon: Icon, label, desc, iconCls, bgCls }) => (
              <div key={label} className="flex gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <div className={`w-8 h-8 ${bgCls} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${iconCls}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">{label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        Built with Next.js · Supabase · Tailwind CSS · Vercel
      </footer>
    </div>
  )
}
