
import { TablePaginationConfig } from 'antd/es/table'
import { FilterValue } from 'antd/es/table/interface'

export interface TableParams {
    pagination?: TablePaginationConfig
    filters?: Record<string, FilterValue | null>
    sortField?: string
    sortOrder?: string
    order?: string
    field?: string
}