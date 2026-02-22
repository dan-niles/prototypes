import { Link } from 'react-router-dom'
import { registry } from '../mockups/_registry'
import { ArrowRight, Layers } from 'lucide-react'

export default function MockupIndex() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-6 py-14">
                <div className="flex items-center gap-3 mb-2">
                    <Layers className="w-6 h-6 text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-900">Mockups</h1>
                </div>
                <p className="text-gray-400 text-sm mb-10 ml-9">
                    {registry.length} mockup{registry.length !== 1 ? 's' : ''}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {registry.map(({ slug, name, description }) => (
                        <Link
                            key={slug}
                            to={`/${slug}`}
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
                            <p className="text-xs text-gray-300 font-mono mt-4">{slug}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
