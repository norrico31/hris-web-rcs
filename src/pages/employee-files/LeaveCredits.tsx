import { useState, useEffect } from 'react'
import { Descriptions, Input, Button, Form as AntDForm, Modal, Space, Switch, Row } from 'antd'
import dayjs from 'dayjs'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Card, Divider, Form, Table } from '../../components'
import { useAxios } from '../../shared/lib/axios'
import { IArguments, ILeaveCredits, ILeaveCreditsHistory, LeaveCreditsHistoryRes, TableParams } from '../../shared/interfaces'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useSearchDebounce } from '../../shared/hooks/useDebounce'

const { GET, POST } = useAxios()

export default function LeaveCredits() {
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalHistory, setIsModalHistory] = useState(false)
    const latestVl = employeeInfo?.latest_vl
    const latestSL = employeeInfo?.latest_sl
    const data = [latestVl, latestSL] ?? []

    const columns: ColumnsType<ILeaveCreditsHistory> = [
        {
            title: 'Type',
            key: 'type',
            dataIndex: 'type',
            width: 150
        },
        {
            title: 'Transfer Type',
            key: 'transfer_type',
            dataIndex: 'transfer_type',
            width: 200
        },
        {
            title: 'Credit',
            key: 'credit',
            dataIndex: 'credit',
            width: 150
        },
        {
            title: 'Debit',
            key: 'debit',
            dataIndex: 'debit',
            width: 150
        },
        {
            title: 'Balance',
            key: 'balance',
            dataIndex: 'balance',
            width: 150
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
            width: 150
        },
        {
            title: 'Remarks',
            key: 'remarks',
            dataIndex: 'remarks',
            width: 220
        },
    ]

    return (
        <Card title="Leave Credits">
            <Row justify='end'>
                <Button className='btn-secondary' onClick={() => setIsModalHistory(true)}>History</Button>
                <LeaveCreditsHistory
                    isModalOpen={isModalHistory}
                    onCancel={() => setIsModalHistory(false)}
                    userId={employeeInfo?.id}
                />
            </Row>
            <Divider />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
            />
            <div style={{ textAlign: 'right', margin: 10 }}>
                <Button type='primary' onClick={() => setIsModalOpen(true)}>Update</Button>
                <LeaveCreditsAdjustment
                    isModalOpen={isModalOpen}
                    handleCancel={() => setIsModalOpen(false)}
                    fetchData={fetchData}
                    latestSL={latestSL}
                    latestVL={latestVl}
                />
            </div>
        </Card>
    )
}

type ModalProps = {
    latestVL: ILeaveCredits
    latestSL: ILeaveCredits
    isModalOpen: boolean
    fetchData: (args?: IArguments | undefined) => void
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function LeaveCreditsAdjustment({ latestVL, latestSL, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<Record<string, any>>()
    const [loading, setLoading] = useState(false)
    const [isVl, setIsVl] = useState(false)

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        const date = dayjs().format('YYYY-MM-DD')
        const payload = {
            ...values,
            id: isVl ? latestVL?.id : latestSL?.id,
            type: isVl ? 'VL' : 'SEL',
            balance: isVl ? latestVL?.balance : latestSL?.balance,
            credit: values.credit === undefined ? 0 : values.credit,
            debit: values.debit === undefined ? 0 : values.debit,
            date
        }
        POST('/leave_credits', payload)
            .then(() => {
                form.resetFields()
                handleCancel()
            }).finally(() => {
                fetchData()
                setLoading(false)
            })
    }

    return <Modal title='Leave Credits - Adjustments' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Item
                label="Type SL / VL"
            >
                <Switch checkedChildren="VL" unCheckedChildren="SL" checked={isVl} onChange={() => setIsVl(!isVl)} />
            </Item>
            <Item
                label="Credit"
                name="credit"
            >
                <Input type='number' placeholder='Enter Credit...' />
            </Item>
            <Item
                label="Debit"
                name="debit"
            >
                <Input type='number' placeholder='Enter Debit...' />
            </Item>
            <Descriptions
                bordered
                layout='vertical'
            >
                <Descriptions.Item label={`Balance - ${isVl ? 'VL' : 'SL'}`}>
                    {!isVl ? latestSL?.balance : latestVL?.balance}
                </Descriptions.Item>
            </Descriptions>
            <Item style={{ textAlign: 'right', margin: '20px 0' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Submit
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}

type LeaveCreditsHistoryProps = {
    userId: string
    isModalOpen: boolean
    onCancel: () => void
}

function LeaveCreditsHistory({ userId, isModalOpen, onCancel }: LeaveCreditsHistoryProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const searchDebounce = useSearchDebounce(search)

    useEffect(() => {
        const controller = new AbortController();
        isModalOpen && fetchData({
            signal: controller.signal,
            search: searchDebounce,
            page: tableParams?.pagination?.current,
            pageSize: tableParams?.pagination?.pageSize
        })
        return () => {
            controller.abort()
        }
    }, [isModalOpen, searchDebounce])

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<LeaveCreditsHistoryRes>('/leave_credits/my/history/' + userId, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => {
                setData(res?.data ?? [])
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res?.total,
                        current: res?.current_page,
                        pageSize: res?.per_page,
                    },
                })
            }).finally(() => setLoading(false))
    }

    const columns: ColumnsType<ILeaveCreditsHistory> = [
        {
            title: 'Type',
            key: 'type',
            dataIndex: 'type',
            width: 150
        },
        {
            title: 'Transfer Type',
            key: 'transfer_type',
            dataIndex: 'transfer_type',
            width: 200
        },
        {
            title: 'Credit',
            key: 'credit',
            dataIndex: 'credit',
            width: 150
        },
        {
            title: 'Debit',
            key: 'debit',
            dataIndex: 'debit',
            width: 150
        },
        {
            title: 'Balance',
            key: 'balance',
            dataIndex: 'balance',
            width: 150
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
            width: 150
        },
        {
            title: 'Remarks',
            key: 'remarks',
            dataIndex: 'remarks',
            width: 220
        },
    ]

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search: searchDebounce, pageSize: pagination?.pageSize! })

    return <Modal title='Leave Credits - History' open={isModalOpen} onCancel={onCancel} footer={null} forceRender width={800}>
        <Row justify='end'>
            <Input.Search placeholder='Search...' value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200 }} />
            <Divider />
        </Row>
        <Table
            loading={loading}
            columns={columns}
            dataList={data}
            tableParams={tableParams}
            onChange={onChange}
        />
        <Divider />
        <Row justify='end'>
            <Button type='primary' onClick={onCancel}>Close</Button>
        </Row>
    </Modal>
}