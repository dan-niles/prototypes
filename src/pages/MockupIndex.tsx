import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registry } from '../mockups/_registry'
import { ArrowRight, Layers, Search } from 'lucide-react'

export default function MockupIndex() {
    const [query, setQuery] = useState('')

    const filtered = registry.filter(({ name, description, slug }) => {
        const q = query.toLowerCase()
        return name.toLowerCase().includes(q) || description.toLowerCase().includes(q) || slug.toLowerCase().includes(q)
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-6 py-14">
                <div className="flex items-center gap-3 mb-2">
                    <Layers className="w-6 h-6 text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-900">Mockups</h1>
                </div>
                <p className="text-gray-400 text-sm mb-6 ml-9">
                    {registry.length} mockup{registry.length !== 1 ? 's' : ''}
                </p>

                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-6 focus-within:border-blue-400 transition-colors">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search mockups..."
                        className="flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400 bg-transparent"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            Clear
                        </button>
                    )}
                </div>

                {filtered.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map(({ slug, name, description, versions }) => {
                            const latest = versions[versions.length - 1].version
                            return (
                                <Link
                                    key={slug}
                                    to={`/${slug}/${latest}`}
                                    className="group flex flex-col justify-between bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-150"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {name}
                                            </h2>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-xs text-gray-300 font-mono">{slug}</p>
                                        {versions.length > 1 && (
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {versions.length} versions
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">No mockups match &ldquo;{query}&rdquo;.</p>
                )}
            </div>
        </div>
    )
}
