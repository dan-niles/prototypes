import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { registry } from '../mockups/_registry'
import { ArrowRight, Layers, Search, Sun, Moon } from 'lucide-react'

function useDarkMode() {
    const [dark, setDark] = useState(() => {
        const stored = localStorage.getItem('theme')
        if (stored) return stored === 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    return [dark, setDark] as const
}

export default function MockupIndex() {
    const [query, setQuery] = useState('')
    const [dark, setDark] = useDarkMode()

    const filtered = registry.filter(({ name, description, slug }) => {
        const q = query.toLowerCase()
        return name.toLowerCase().includes(q) || description.toLowerCase().includes(q) || slug.toLowerCase().includes(q)
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
            <div className="max-w-4xl mx-auto px-6 py-14">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <Layers className="w-6 h-6 text-blue-500" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Mockups</h1>
                    </div>
                    <button
                        onClick={() => setDark(d => !d)}
                        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-neutral-500 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                    >
                        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-gray-400 dark:text-neutral-600 text-sm mb-6 ml-9">
                    {registry.length} mockup{registry.length !== 1 ? 's' : ''}
                </p>

                <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg px-3 py-2 mb-6 focus-within:border-blue-400 dark:focus-within:border-neutral-500 transition-colors">
                    <Search className="w-4 h-4 text-gray-400 dark:text-neutral-600 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search mockups..."
                        className="flex-1 text-sm text-gray-700 dark:text-neutral-200 outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-600 bg-transparent"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-xs text-gray-400 hover:text-gray-600 dark:text-neutral-600 dark:hover:text-neutral-400 transition-colors">
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
                                    className="group flex flex-col justify-between bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700/60 p-5 hover:border-blue-400 dark:hover:border-neutral-500 hover:shadow-md dark:hover:shadow-none transition-all duration-150"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <h2 className="font-semibold text-gray-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
                                                {name}
                                            </h2>
                                            <ArrowRight className="w-4 h-4 text-gray-300 dark:text-neutral-700 group-hover:text-blue-400 dark:group-hover:text-neutral-400 shrink-0 mt-0.5 transition-colors" />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">{description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-xs text-gray-300 dark:text-neutral-700 font-mono">{slug}</p>
                                        {versions.length > 1 && (
                                            <span className="text-xs text-gray-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                                {versions.length} versions
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-neutral-600">No mockups match &ldquo;{query}&rdquo;.</p>
                )}
            </div>
        </div>
    )
}
