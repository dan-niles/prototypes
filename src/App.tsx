import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams, Link } from 'react-router-dom'
import { registry } from './mockups/_registry'
import MockupIndex from './pages/MockupIndex'
import { Loader2 } from 'lucide-react'

function MockupRoute() {
  const { slug } = useParams<{ slug: string }>()
  const entry = registry.find((m) => m.slug === slug)
  if (!entry) return <Navigate to="/" replace />
  const Component = entry.component

  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        }
      >
        <Component />
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/mockups">
      <Routes>
        <Route path="/" element={<MockupIndex />} />
        <Route path="/:slug" element={<MockupRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

