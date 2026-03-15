import { useState, Children, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import notesContent from './notes.md?raw';
import { ArrowRight, X } from 'lucide-react';

const noteImages = import.meta.glob('./img/*.*', { eager: true, import: 'default' }) as Record<string, string>;

interface NotesPanelProps {
    onAction: (action: string) => void;
}

export default function NotesPanel({ onAction }: NotesPanelProps) {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    return (
        <>
            <div
                className="flex-1 bg-white relative border-r border-gray-200 overflow-y-auto"
                onClick={(e) => {
                    const target = (e.target as HTMLElement).closest('a[href^="#action-"]');
                    if (!target) return;
                    e.preventDefault();
                    const href = target.getAttribute('href') || '';
                    const action = href.replace('#action-', '');
                    onAction(action);
                }}
            >
                <div className="max-w-2xl mx-auto px-8 py-12">
                    <ReactMarkdown
                        components={{
                            h1: (props: ComponentPropsWithoutRef<'h1'>) => <h1 className="text-2xl font-bold text-gray-900 mb-2" {...props} />,
                            h2: (props: ComponentPropsWithoutRef<'h2'>) => <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3" {...props} />,
                            p: ({ children }: ComponentPropsWithoutRef<'p'>) => {
                                const kids = Children.toArray(children as ReactNode);
                                const nonWhitespace = kids.filter((child) => !(typeof child === 'string' && !child.trim()));
                                const allImages = nonWhitespace.length > 0 && nonWhitespace.every(
                                    (child) => isValidElement(child) && (child.props as any)?.src !== undefined
                                );
                                if (allImages) {
                                    return <div className={`flex flex-wrap gap-4 mb-3 ${nonWhitespace.length > 1 ? 'items-start' : ''}`}>{children}</div>;
                                }
                                return <p className="text-[14px] text-gray-600 leading-relaxed mb-3">{children}</p>;
                            },
                            hr: (props: ComponentPropsWithoutRef<'hr'>) => <hr className="border-gray-100 my-6" {...props} />,
                            ul: (props: ComponentPropsWithoutRef<'ul'>) => <ul className="list-disc pl-5 text-[14px] text-gray-600 space-y-1 mb-3" {...props} />,
                            li: (props: ComponentPropsWithoutRef<'li'>) => <li className="leading-relaxed" {...props} />,
                            strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong className="text-gray-800 font-semibold" {...props} />,
                            code: (props: ComponentPropsWithoutRef<'code'>) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[13px] text-gray-700" {...props} />,
                            img: ({ src, alt }: ComponentPropsWithoutRef<'img'>) => {
                                const [path, hash] = (src || '').split('#');
                                const width = hash?.match(/width=(\d+)/)?.[1];
                                const resolved = (path ? noteImages[`./${path}`] : undefined) || path;
                                return (
                                    <figure className="my-3">
                                        <img
                                            src={resolved}
                                            alt={alt}
                                            style={width ? { width: `${width}px` } : undefined}
                                            className="rounded-lg border border-gray-200 shadow-sm max-w-full cursor-zoom-in hover:shadow-md transition-shadow"
                                            onClick={() => setLightboxSrc(resolved || '')}
                                        />
                                        {alt && <figcaption className="text-[12px] text-gray-400 mt-1 italic text-center" style={width ? { width: `${width}px` } : undefined}>{alt}</figcaption>}
                                    </figure>
                                );
                            },
                            a: ({ href, children }: ComponentPropsWithoutRef<'a'>) => {
                                if (href?.startsWith('#action-')) {
                                    return (
                                        <a
                                            href={href}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[12.5px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer no-underline"
                                        >
                                            <ArrowRight size={12} strokeWidth={2} />
                                            {children}
                                        </a>
                                    );
                                }
                                return <a href={href} className="text-blue-600 hover:underline">{children}</a>;
                            },
                        }}
                    >
                        {notesContent}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxSrc && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center cursor-zoom-out animate-in fade-in duration-150"
                    onClick={() => setLightboxSrc(null)}
                >
                    <button
                        onClick={() => setLightboxSrc(null)}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={24} strokeWidth={2} />
                    </button>
                    <img
                        src={lightboxSrc}
                        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
