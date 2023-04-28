import { ReactNode, memo } from 'react'
import { Table as AntDTable } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { FilterValue, TableCurrentDataSource } from 'antd/es/table/interface'
import { TableParams } from '../shared/interfaces'

type TableListProps<T> = {
    loading?: boolean
    columns: ColumnsType<T>
    tableParams?: TableParams
    isSizeChanger?: boolean
    onChange?: ((pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: any, extra: TableCurrentDataSource<any>) => void) | undefined
    dataList: T
}

function Table({ loading, isSizeChanger = true, columns, dataList, tableParams, onChange }: TableListProps<any>) {
    return (
        <div>
            <AntDTable
                loading={loading}
                dataSource={dataList}
                pagination={{
                    ...tableParams?.pagination,
                    showSizeChanger: isSizeChanger,
                    position: ['bottomCenter'],
                    showTotal: (number: number) => <p style={{ marginRight: '1rem' }}>Total: {number}</p>,
                    itemRender: ItemRender,
                }}
                columns={columns}
                scroll={scroll}
                rowKey={(data: any) => data?.id}
                onChange={onChange}
            />
        </div>
    );
}

function ItemRender(_: number, type: string, originalElement: ReactNode) {
    if (type === 'prev') return <a id='#pagination'>Previous</a>
    if (type === 'next') return <a id='#pagination'>Next</a>
    return originalElement
}

const scroll = { y: 600, x: 500 }

export default memo(Table)