import { ReactNode, memo } from 'react'
import { Table as AntDTable } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { FilterValue, TableCurrentDataSource } from 'antd/es/table/interface'
import { TableParams } from '../shared/interfaces'
import useWindowSize from '../shared/hooks/useWindowSize'

type TableListProps<T> = {
    loading?: boolean
    columns: ColumnsType<T>
    tableParams?: TableParams
    isSizeChanger?: boolean
    onChange?: ((pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: any, extra: TableCurrentDataSource<any>) => void) | undefined
    dataList: T
    rowSelection?: any
}

function Table({ loading, isSizeChanger = true, columns, rowSelection, dataList, tableParams, onChange }: TableListProps<any>) {
    return (
        <div>
            <AntDTable
                loading={loading}
                bordered
                dataSource={dataList}
                rowSelection={rowSelection}
                pagination={tableParams ? {
                    ...tableParams?.pagination,
                    showSizeChanger: isSizeChanger,
                    position: ['bottomCenter'],
                    showTotal: (number: number) => <p style={{ marginRight: '1rem' }}>Total: {number}</p>,
                    itemRender: ItemRender,
                } : false}
                columns={columns}
                scroll={{ x: 100, }}
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

export default memo(Table)