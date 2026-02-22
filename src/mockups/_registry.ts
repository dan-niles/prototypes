import { lazy, type ComponentType } from 'react'

export interface MockupEntry {
    slug: string
    name: string
    description: string
    component: React.LazyExoticComponent<ComponentType>
}

export const registry: MockupEntry[] = [
    {
        slug: 'bi-data-tree',
        name: 'Data Tree',
        description: 'A data tree for the expression editor in WSO2 Integrator: BI',
        component: lazy(() => import('./bi-data-tree/index')),
    },
]
