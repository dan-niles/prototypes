import { lazy, type ComponentType } from 'react'

export interface MockupEntry {
    slug: string
    name: string
    description: string
    component: React.LazyExoticComponent<ComponentType>
}

export const registry: MockupEntry[] = [
    {
        slug: 'example-dashboard',
        name: 'Example Dashboard',
        description: 'A sample admin dashboard layout',
        component: lazy(() => import('./example-dashboard/index')),
    },
]
