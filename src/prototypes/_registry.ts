import { lazy, type ComponentType } from 'react'

export interface PrototypeVersion {
    version: string
    label?: string
    component: React.LazyExoticComponent<ComponentType>
}

export interface PrototypeEntry {
    slug: string
    name: string
    description: string
    versions: PrototypeVersion[]
}

export const registry: PrototypeEntry[] = [
    {
        slug: 'bi-prompt-enhancer',
        name: 'Prompt Enhancer',
        description: 'A prompt enhancer for WSO2 Integrator: BI',
        versions: [
            {
                version: 'v1',
                component: lazy(() => import('./bi-prompt-enhancer/v1/index')),
            },
            {
                version: 'v2',
                component: lazy(() => import('./bi-prompt-enhancer/v2/index')),
            },
        ],
    },
    {
        slug: 'bi-function-inputs',
        name: 'Function Inputs',
        description: 'A function inputs view for the flow diagram in WSO2 Integrator: BI',
        versions: [
            {
                version: 'v1',
                component: lazy(() => import('./bi-function-inputs/v1/index')),
            },
            {
                version: 'v2',
                component: lazy(() => import('./bi-function-inputs/v2/index')),
            },
            {
                version: 'v3',
                component: lazy(() => import('./bi-function-inputs/v3/index')),
            },
        ],
    },
    {
        slug: 'bi-data-tree',
        name: 'Data Tree',
        description: 'A data tree for the expression editor in WSO2 Integrator: BI',
        versions: [
            {
                version: 'v1',
                component: lazy(() => import('./bi-data-tree/index')),
            },
        ],
    },
    {
        slug: 'bi-evalset-editor',
        name: 'Evalset Editor',
        description: 'An evalset editor for WSO2 Integrator: BI',
        versions: [
            {
                version: 'v1',
                component: lazy(() => import('./bi-evalset-editor/index')),
            },
        ],
    },
    {
        slug: 'bi-chat-agent-logs',
        name: 'Chat Agent Logs',
        description: 'Revamped chat agent logs view for WSO2 Integrator: BI',
        versions: [
            {
                version: 'v1',
                component: lazy(() => import('./bi-chat-agent-logs/index')),
            },
        ],
    },
]
