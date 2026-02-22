import { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft,
    Undo,
    Redo,
    Settings,
    Maximize,
    Plus,
    Minus,
    ChevronDown,
    CornerDownLeft,
    MoreVertical,
    Beaker,
    X
} from 'lucide-react';

const LowCodeCanvasHeaderView = () => {
    // State for the header dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const [parameters, setParameters] = useState([
        { type: 'int', name: 'num1' },
        { type: 'int', name: 'num2' },
    ]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper functions for the live-testing toggle
    const addParameter = () => {
        const types = ['int', 'string', 'boolean', 'float', 'any'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        setParameters([
            ...parameters,
            { type: randomType, name: `param${parameters.length + 1}` }
        ]);
    };

    const removeParameter = () => {
        if (parameters.length > 0) {
            setParameters(parameters.slice(0, -1));
        }
    };

    return (
        <div className="flex flex-col h-screen w-full font-sans text-gray-800 bg-white">
            {/* --- Top Navigation Bar --- */}
            <header className="relative flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white z-30">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-600 flex-shrink-0">
                        <ArrowLeft size={20} />
                    </button>

                    {/* Function Signature Area */}
                    <div className="flex items-center min-w-0">
                        <h1 className="text-lg font-semibold text-gray-900 mr-2 flex-shrink-0">Function</h1>
                        <span className="text-sm font-mono text-gray-700 flex-shrink-0">multiply</span>

                        {/* Inline Parameters - ONLY SHOW IF PARAMETERS EXIST */}
                        {parameters.length > 0 && (
                            <div className="flex items-center ml-2 text-sm min-w-0">
                                <span className="text-gray-400 font-mono mr-1.5 flex-shrink-0">(</span>

                                <div className="flex items-center gap-2 overflow-hidden">
                                    {/* Show up to 2 params inline for space management */}
                                    {parameters.slice(0, 2).map((param, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 font-mono whitespace-nowrap">
                                            <span className="text-blue-600 font-medium bg-blue-50 px-1 rounded text-xs border border-blue-100/50">
                                                {param.type}
                                            </span>
                                            <span className="text-gray-800">{param.name}</span>
                                            {idx < Math.min(parameters.length, 2) - 1 && (
                                                <span className="text-gray-400">,</span>
                                            )}
                                        </div>
                                    ))}
                                    {/* Truncation Badge */}
                                    {parameters.length > 2 && (
                                        <span className="text-gray-500 font-mono text-xs whitespace-nowrap ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                            +{parameters.length - 2} more
                                        </span>
                                    )}
                                </div>

                                <span className="text-gray-400 font-mono ml-1.5 flex-shrink-0">)</span>

                                {/* Chevron Trigger */}
                                <button
                                    ref={triggerRef}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`ml-2 p-1 rounded-md transition-colors flex-shrink-0 ${isDropdownOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                                >
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2 text-gray-400">
                        <button className="p-1 hover:bg-gray-100 rounded hover:text-gray-600"><Undo size={18} /></button>
                        <button className="p-1 hover:bg-gray-100 rounded hover:text-gray-600"><Redo size={18} /></button>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-md transition-colors">
                        <Settings size={16} />
                        Configure
                    </button>
                </div>

                {/* --- The Expanded Parameters Dropdown --- */}
                {isDropdownOpen && parameters.length > 0 && (
                    <div
                        ref={dropdownRef}
                        className="absolute top-full left-[220px] mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50"
                    >
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <span className="font-medium text-sm text-gray-800">All Parameters ({parameters.length})</span>
                            <button onClick={() => setIsDropdownOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2 bg-white">
                            <div className="flex flex-col gap-1">
                                {parameters.map((param, idx) => (
                                    <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <span className="text-blue-600 font-mono text-xs font-semibold bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                            {param.type}
                                        </span>
                                        <span className="text-gray-900 font-mono text-sm">
                                            {param.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Canvas Area */}
            <main className="flex-1 relative overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px]">

                {/* View Toggles */}
                <div className="absolute top-6 right-6 flex bg-gray-50 border border-gray-200 rounded-lg p-1 z-10 shadow-sm">
                    <button className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-white shadow-sm rounded-md">Flow</button>
                    <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md">Sequence</button>
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-10">
                    <button className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600"><Maximize size={18} /></button>
                    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden text-gray-600">
                        <button className="p-2 hover:bg-gray-50 border-b border-gray-200"><Plus size={18} /></button>
                        <button className="p-2 hover:bg-gray-50"><Minus size={18} /></button>
                    </div>
                </div>

                {/* Live Tester Controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20 bg-white border border-blue-200 rounded-lg shadow-md overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider">
                        <Beaker size={14} />
                        Test Params UI
                    </div>
                    <div className="flex items-center justify-between p-2 gap-4">
                        <span className="text-sm font-medium text-gray-600 ml-2">Count: {parameters.length}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={removeParameter} disabled={parameters.length === 0} className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"><Minus size={16} /></button>
                            <button onClick={addParameter} className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"><Plus size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Center: The Flow Nodes (V1 Style) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="px-10 py-3 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-900 min-w-[140px] flex justify-center hover:border-blue-400 transition-colors cursor-pointer">
                        Start
                    </div>
                    <svg width="2" height="40" className="my-1" overflow="visible">
                        <line x1="1" y1="0" x2="1" y2="34" stroke="#2563eb" strokeWidth="2" />
                        <polygon points="1,40 -3,32 5,32" fill="#2563eb" />
                    </svg>
                    <div className="w-72 bg-white border border-gray-300 rounded-xl shadow-sm p-4 flex items-center justify-between hover:border-blue-400 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <CornerDownLeft size={20} className="text-blue-600" />
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-900 text-sm">Return</span>
                                <span className="font-mono text-xs text-gray-500 mt-1">num1 * num2</span>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default LowCodeCanvasHeaderView;
