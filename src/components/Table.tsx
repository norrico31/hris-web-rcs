import { Table as AntDTable } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { FilterValue, TableCurrentDataSource } from 'antd/es/table/interface';
import { ReactNode } from 'react';

interface TableParams {
    pagination?: TablePaginationConfig
    filters?: Record<string, FilterValue | null>
    sortField?: string
    sortOrder?: string
    order?: string
    field?: string
}

type TableListProps<T> = {
    loading: boolean
    columns: ColumnsType<T>
    tableParams?: TableParams
    onChange?: ((pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: any, extra: TableCurrentDataSource<any>) => void) | undefined
    dataList: T
}

export default function Table({ loading, columns, dataList, tableParams, onChange }: TableListProps<any>) {
    return (
        <div>
            <AntDTable
                loading={loading}
                dataSource={dataList}
                // rowSelection={{
                //     type: 'checkbox',
                //     onChange: (selectedRowKeys: React.Key[], selectedRows: string[]) => {
                //         console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                //     },
                // }}
                pagination={{
                    ...tableParams?.pagination,
                    showSizeChanger: true,
                    position: ['bottomCenter'],
                    showTotal: (number: number) => <p style={{ marginRight: '1rem' }}>Total: {number}</p>,
                    itemRender: ItemRender,
                }}
                columns={columns}
                scroll={{ y: 600, x: 500 }}
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