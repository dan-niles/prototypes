import React, { useState } from 'react';
import {
    Play, CheckCircle2, Clock, Database, MessageSquare,
    Layers, Code, Braces, ChevronDown, ChevronRight
} from 'lucide-react';
import './SpanTree.css';

interface TreeNodeData {
    label: string;
    type: string;
    duration?: string;
    tokens?: number;
    children?: TreeNodeData[];
}

const getIcon = (type: string) => {
    switch (type) {
        case 'agent': return <Play size={14} className="text-green-400" fill="currentColor" />;
        case 'chain': return <Layers size={14} className="text-blue-400" />;
        case 'prompt': return <MessageSquare size={14} className="text-purple-400" />;
        case 'llm': return <CheckCircle2 size={14} className="text-orange-400" />;
        case 'tool': return <Code size={14} className="text-gray-400" />;
        case 'retriever': return <Database size={14} className="text-pink-400" />;
        case 'parser': return <Braces size={14} className="text-cyan-400" />;
        default: return <Layers size={14} />;
    }
};

const TreeNode = ({ node, isLast }: { node: TreeNodeData; isLast: boolean }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className={`tree-node ${isLast ? 'is-last' : ''}`}>

            {/* THE FIX:
        This line (node-line) now connects the CENTER of this node 
        to the next node below. We hide it if this is the last node.
      */}
            <div className="node-line" />

            <div
                className={`node-row ${isOpen ? 'expanded' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* The Elbow handles the Top-to-Center connection + Curve */}
                <div className="node-connector-elbow" />

                <div className="node-icon-wrapper">
                    {getIcon(node.type)}
                </div>

                <div className="node-content">
                    <span className="node-label">{node.label}</span>
                    <div className="node-metrics">
                        {node.duration && (
                            <span className="metric-tag">
                                <Clock size={10} className="mr-1" />{node.duration}
                            </span>
                        )}
                        {node.tokens && (
                            <span className="metric-tag">
                                <Database size={10} className="mr-1" />{node.tokens}
                            </span>
                        )}
                    </div>
                </div>

                <div className="node-toggle">
                    {hasChildren && (
                        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    )}
                </div>
            </div>

            {hasChildren && isOpen && (
                <div className="node-children">
                    {node.children!.map((child, index) => (
                        <TreeNode
                            key={index}
                            node={child}
                            isLast={index === node.children!.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const SpanTree = () => {
    const traceData = {
        label: "Sample Agent Trace", type: "agent", duration: "7.31s", tokens: 540,
        children: [
            {
                label: "RunnableAgent", type: "chain", duration: "1.89s", tokens: 150,
                children: [
                    {
                        label: "RunnableMap", type: "chain", duration: "0.27s",
                        children: [{ label: "RunnableLambda", type: "tool", duration: "0.10s" }]
                    },
                    { label: "ChatPromptTemplate", type: "prompt", duration: "0.07s" },
                    { label: "ChatOpenAI", type: "llm", duration: "0.95s", tokens: 150 },
                    { label: "OpenAIFunctionsAgentOutputParser", type: "parser", duration: "0.10s" }
                ]
            },
            {
                label: "search_latest_knowledge", type: "tool", duration: "0.76s",
                children: [{ label: "VectorStoreRetriever", type: "retriever", duration: "0.52s" }]
            },
            {
                label: "RunnableAgent", type: "chain", duration: "4.27s", tokens: 390,
                children: [
                    {
                        label: "RunnableMap", type: "chain", duration: "0.26s",
                        children: [{ label: "RunnableLambda", type: "tool", duration: "0.09s" }]
                    }
                ]
            }
        ]
    };

    return (
        <div className="span-tree-wrapper">
            <TreeNode node={traceData} isLast={true} />
        </div>
    );
};

export default SpanTree;