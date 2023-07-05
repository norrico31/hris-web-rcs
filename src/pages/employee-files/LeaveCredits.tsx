import { useState, useEffect } from 'react'
import { Descriptions, Input, Button, Form as AntDForm, Modal, Space, Switch, Row } from 'antd'
import dayjs from 'dayjs'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Action, Card, Divider, Form, Table } from '../../components'
import { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'
import { IArguments, ILeaveCredits, TableParams } from '../../shared/interfaces'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useSearchDebounce } from '../../shared/hooks/useDebounce'

const [{ EMPLOYEE201: { EMPLOYEESALARY }, SYSTEMSETTINGS: { HRSETTINGS: { SALARYRATES } } }] = useEndpoints()
const { GET, POST, DELETE, PUT } = useAxios()

export default function LeaveCredits() {
    const { employeeInfo, fetchData } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalHistory, setIsModalHistory] = useState(false)
    const latestVl = employeeInfo?.latest_vl
    const latestSL = employeeInfo?.latest_sl

    return (
        <Card title="Leave Credits">
            <Row justify='end'>
                <Button className='btn-secondary' onClick={() => setIsModalHistory(true)}>History</Button>
                <LeaveCreditsHistory isModalOpen={isModalHistory} onCancel={() => setIsModalHistory(false)} />
            </Row>
            <Divider />
            <Descriptions
                layout='vertical'
                bordered
                column={{ xxl: 6, xl: 6, lg: 6, md: 6, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="Type">
                    <b>{latestVl?.type}</b>
                </Descriptions.Item>
                <Descriptions.Item label="Transfer Type">
                    <b>{latestVl?.transfer_type}</b>
                </Descriptions.Item>
                <Descriptions.Item label="Credit">
                    <b>{latestVl?.credit}</b>
                </Descriptions.Item>
                <Descriptions.Item label="Debit">
                    <b>{latestVl?.debit}</b>
                </Descriptions.Item>
                <Descriptions.Item label="Balance">
                    <b>{latestVl?.balance}</b>
                </Descriptions.Item>
                <Descriptions.Item label="Remarks">
                    <b>{latestVl?.remarks}</b>
                </Descriptions.Item>
                <Descriptions.Item>
                    <b>{latestSL?.type}</b>
                </Descriptions.Item>
                <Descriptions.Item >
                    <b>{latestSL?.transfer_type}</b>
                </Descriptions.Item>
                <Descriptions.Item >
                    <b>{latestSL?.credit}</b>
                </Descriptions.Item>
                <Descriptions.Item >
                    <b>{latestSL?.debit}</b>
                </Descriptions.Item>
                <Descriptions.Item >
                    <b>{latestSL?.balance}</b>
                </Descriptions.Item>
                <Descriptions.Item >
                    <b>{latestSL?.remarks}</b>
                </Descriptions.Item>
            </Descriptions>
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
            type: isVl ? 'VL' : 'SL',
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
    isModalOpen: boolean
    onCancel: () => void
}

function LeaveCreditsHistory({ isModalOpen, onCancel }: LeaveCreditsHistoryProps) {
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
        GET<any>('/leave_credits/my/history', args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const columns: ColumnsType<any> = [
        {
            title: 'Title',
            key: 'title',
            dataIndex: 'title',
            width: 150
        },
        {
            title: 'Content',
            key: 'content',
            dataIndex: 'content',
            render: (_, record) => <div dangerouslySetInnerHTML={{ __html: record?.content.slice(0, 20) + '...' }} />,
            width: 150
        },
        {
            title: 'Publish Date',
            key: 'publish_date',
            dataIndex: 'publish_date',
            width: 120
        },
    ]

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search: searchDebounce, pageSize: pagination?.pageSize! })

    return <Modal title='Leave Credits - History' open={isModalOpen} onCancel={onCancel} footer={null} forceRender>
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
            <Button type='primary'>Close</Button>
        </Row>
    </Modal>
}