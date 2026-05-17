export interface CatalogItem {
  id: string
  label: string
  count: number
}

export const catalogCategories: CatalogItem[] = [
  { id: 'all', label: 'All Projects', count: 12 },
  { id: 'frontend', label: 'Frontend', count: 3 },
  { id: 'backend', label: 'Backend', count: 4 },
  { id: 'automation', label: 'Automation', count: 4 },
  { id: 'hardware', label: 'Hardware', count: 1 },
]
