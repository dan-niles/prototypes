import { lazy, type ComponentType } from 'react'

export interface MockupVersion {
    version: string
    label?: string
    component: React.LazyExoticComponent<ComponentType>
}

export interface MockupEntry {
    slug: string
    name: string
    description: string
    versions: MockupVersion[]
}

export const registry: MockupEntry[] = [
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
]
