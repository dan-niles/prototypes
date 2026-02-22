import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams, Link } from 'react-router-dom'
import { registry } from './prototypes/_registry'
import PrototypeIndex from './pages/PrototypeIndex'
import { Loader2, ArrowLeft } from 'lucide-react'

function PrototypeRoute() {
  const { slug, version } = useParams<{ slug: string; version: string }>()
  const entry = registry.find((m) => m.slug === slug)
  if (!entry) return <Navigate to="/" replace />

  // /:slug with no version → redirect to latest
  if (!version) {
    const latest = entry.versions[entry.versions.length - 1].version
    return <Navigate to={`/${slug}/${latest}`} replace />
  }

  const versionEntry = entry.versions.find((v) => v.version === version)
  if (!versionEntry) {
    const latest = entry.versions[entry.versions.length - 1].version
    return <Navigate to={`/${slug}/${latest}`} replace />
  }

  const Component = versionEntry.component
  const latest = entry.versions[entry.versions.length - 1].version

  return (
    <div className="relative">
      {/* Floating controls — nearly invisible until hovered */}
      <div className="group fixed bottom-4 left-4 z-50 flex items-center gap-1 bg-black/10 hover:bg-white hover:shadow-lg rounded-full px-2 py-1.5 transition-all duration-200 hover:px-3">
        <Link
          to="/"
          title="All Prototypes"
          className="flex items-center gap-1.5 text-white/60 group-hover:text-gray-500 hover:!text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="text-xs font-medium hidden group-hover:inline">All Prototypes</span>
        </Link>
        {entry.versions.length > 1 && (
          <>
            <span className="text-white/30 group-hover:text-gray-200 text-xs mx-0.5 hidden group-hover:inline">/</span>
            <div className="hidden group-hover:flex items-center gap-0.5">
              {entry.versions.map(({ version: v, label }) => (
                <Link
                  key={v}
                  to={`/${slug}/${v}`}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${v === version
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {label ?? v.toUpperCase()}
                  {v === latest && v !== version && (
                    <span className="ml-1 text-gray-300">↑</span>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/prototypes">
      <Routes>
        <Route path="/" element={<PrototypeIndex />} />
        <Route path="/:slug" element={<PrototypeRoute />} />
        <Route path="/:slug/:version" element={<PrototypeRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

