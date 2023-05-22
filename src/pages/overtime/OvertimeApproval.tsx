import { useState, useEffect, useMemo, useRef } from 'react'
import { Button, Col, DatePicker, Form as AntDForm, Input, Modal, Popconfirm, Row, Select, Skeleton, Space, TimePicker, Descriptions } from 'antd'
import { Navigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Card, Divider, Form, TabHeader, Table } from '../../components'
import { firstLetterCapitalize, renderTitle } from '../../shared/utils/utilities'
import { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, IOvertime, OvertimeRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'
import { FcApproval } from 'react-icons/fc'
import { RxCross2 } from 'react-icons/rx'
import useWindowSize from '../../shared/hooks/useWindowSize'
import { OvertimeModal } from './MyOvertime'
import { AxiosResponse } from 'axios'
import useMessage from 'antd/es/message/useMessage'

const { GET, POST, PUT } = useAxios()
const [{ OVERTIME }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function OvertimeApproval() {
    renderTitle('Overtime Approval')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [overtimeType, setOvertimeType] = useState('all')
    const [data, setData] = useState<IOvertime[]>([])
    const [selectedData, setSelectedData] = useState<IOvertime | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const { width } = useWindowSize()
    const [isModalRequest, setIsModalRequest] = useState(false)
    const [isApproved, setIsApproved] = useState(false)

    useEffect(function fetch() {
        const controller = new AbortController();
        if (user != undefined) fetchData({
            args: {
                signal: controller.signal, search,
                page: tableParams?.pagination?.current,
                pageSize: tableParams?.pagination?.pageSize,
            },
            type: overtimeType
        })
        return () => {
            controller.abort()
        }
    }, [user, search])

    const codes = filterCodes(user?.role?.permissions)
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['f06'].every((c) => !codes[c])) return <Navigate to='/overtime/myovertime' />

    const columns: ColumnsType<IOvertime> = [
        {
            title: 'Submitted by',
            key: 'full_name',
            dataIndex: 'full_name',
            render: (_, record) => record?.user?.full_name ?? '-',
            width: 170,
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 120,
        },
        {
            title: 'Date Start',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 150,
            render: (_, record) => `${dayjs(record?.date_start).format('MMMM')} ${dayjs(record?.date_start).format('D')}, ${dayjs(record?.date_start).format('YYYY')}`
        },
        {
            title: 'Date End',
            key: 'date_end',
            dataIndex: 'date_end',
            width: 150,
            render: (_, record) => `${dayjs(record?.date_end).format('MMMM')} ${dayjs(record?.date_end).format('D')}, ${dayjs(record?.date_end).format('YYYY')}`
        },
        {
            title: 'Time Start',
            key: 'planned_ot_start',
            dataIndex: 'planned_ot_start',
            width: 150
        },
        {
            title: 'Time End',
            key: 'planned_ot_end',
            dataIndex: 'planned_ot_end',
            width: 150
        },
        {
            title: 'Reason',
            key: 'reason',
            dataIndex: 'reason',
            width: 250,
            align: 'center'
        },
        {
            title: 'Actions',
            key: 'approver',
            dataIndex: 'approver',
            align: 'center',
            render: (_: any, record: IOvertime) => <Space>
                <Button id='approve' size='middle' disabled={record?.status.toLowerCase() == 'approved'} onClick={() => selectedRequest(record, true)} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <FcApproval />
                    Approve
                </Button>
                <Button id='reject' size='middle' disabled={record?.status.toLowerCase() == 'approved'} onClick={() => selectedRequest(record, false)} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <RxCross2 />
                    Reject
                </Button>
            </Space>,
            width: 250
        }
    ]

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `&status=${type?.toUpperCase()}` : ''
        const url = OVERTIME.GET + 'true' + status
        GET<OvertimeRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
            })
            .catch((err) => err)
            .finally(() => setLoading(false))
    }

    async function overtimeApproval(url: string, payload: Payload) {
        setLoading(true)
        try {
            try {
                const res = await PUT(OVERTIME.POST + url, payload)
                closeModal()
                return Promise.resolve(res)
            } catch (err) {
                return Promise.reject(err)
            }
        } finally {
            setLoading(false)
            fetchData({ type: overtimeType })
        }
    }

    function selectedRequest(overtime: IOvertime, isApproved: boolean) {
        setSelectedData(overtime)
        setIsApproved(isApproved)
        setIsModalRequest(true)
    }

    function closeModal() {
        setSelectedData(undefined)
        setIsModalRequest(false)
        setIsApproved(false)
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: overtimeType })

    return (
        <>
            <Row justify='space-between' wrap>
                <Select value={overtimeType} allowClear showSearch optionFilterProp='children' onChange={(str) => {
                    setOvertimeType((str == undefined || str == '') ? 'all' : str)
                    fetchData({
                        args: {
                            search,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize
                        },
                        type: (str == undefined || str == '') ? 'all' : str
                    })
                }} style={{ width: 150 }}>
                    <Select.Option value='all'>All</Select.Option>
                    <Select.Option value='pending'>Pending</Select.Option>
                    <Select.Option value='approved'>Approved</Select.Option>
                    <Select.Option value='reject'>Rejected</Select.Option>
                </Select>
                {width < 978 && <Divider />}
                <Col>
                    <Space>
                        <DatePicker.RangePicker />
                        <Input.Search placeholder='Search...' value={search} onChange={(evt) => setSearch(evt.target.value)} />
                        <Button type='primary' onClick={() => setIsModalOpen(true)}>Request</Button>
                    </Space>
                </Col>
            </Row>
            <Divider />
            <Card title={`For Approval - ${firstLetterCapitalize(overtimeType)}`} level={5}>
                <Table
                    loading={loading}
                    columns={columns}
                    dataList={data}
                    tableParams={tableParams}
                    onChange={onChange}
                />
            </Card>
            <OvertimeApprovalModal
                loading={loading}
                overtimeApproval={overtimeApproval}
                isModalOpen={isModalRequest}
                isApproved={isApproved}
                selectedRequest={selectedData}
                handleClose={closeModal}
            />
            <OvertimeModal
                overtimeType={overtimeType}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                selectedData={selectedData}
                handleCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}

type Payload = {
    remarks: string
    reason: string
    date: string
    planned_ot_start: string
    planned_ot_end: string
}

interface ModalProps {
    isModalOpen: boolean
    isApproved: boolean
    loading: boolean
    selectedRequest?: IOvertime
    handleClose: () => void
    overtimeApproval(url: string, remarks: Payload): Promise<AxiosResponse<any, any>>
}

function OvertimeApprovalModal({ isApproved, loading, selectedRequest, isModalOpen, overtimeApproval, handleClose }: ModalProps) {
    const remarksRef = useRef<HTMLTextAreaElement>(null)
    const [messageApi, contextHolder] = useMessage()

    async function onSubmit() {
        if (remarksRef?.current == null || remarksRef?.current.value == '') {
            return messageApi.open({
                type: 'error',
                content: `Please enter remarks before ${isApproved ? 'approve' : 'reject'}`,
                duration: 5
            })
        }
        try {
            const url = isApproved ? 'approve-overtime/' : 'reject-overtime/'
            const payload = {
                remarks: remarksRef.current.value,
                date: selectedRequest?.date,
                planned_ot_start: selectedRequest?.planned_ot_start,
                planned_ot_end: selectedRequest?.planned_ot_end,
                reason: selectedRequest?.reason
            } as Payload
            const res = await overtimeApproval(url + selectedRequest?.id, payload)
            console.log('overtime approval result: ', res)
            remarksRef?.current.value == ''
        } catch (err: any) {
            messageApi.open({
                type: 'error',
                content: err?.response?.data?.message,
                duration: 5
            })
            return err
        }
    }
    return <Modal title={`Overtime - ${isApproved ? 'Approve' : 'Reject'}`} open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
        {contextHolder}
        <Descriptions bordered column={2}>
            <Descriptions.Item label="Requested By" span={2}>{selectedRequest?.user?.full_name}</Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>{selectedRequest?.status}</Descriptions.Item>
            <Descriptions.Item label="Date Requested" span={2}>{selectedRequest?.date?.toString()}</Descriptions.Item>
            <Descriptions.Item label="Planned OT Start" span={2}>{selectedRequest?.planned_ot_start?.toString()}</Descriptions.Item>
            <Descriptions.Item label="Planned OT End" span={2}>{selectedRequest?.planned_ot_end?.toString()}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions bordered layout='vertical'>
            <Descriptions.Item label="Reason" style={{ textAlign: 'center' }}>{selectedRequest?.reason}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions bordered>
            <Descriptions.Item label="Remarks" >
                <Input.TextArea placeholder='Remarks...' ref={remarksRef} style={{ height: 150 }} />
            </Descriptions.Item>
        </Descriptions>
        <Divider />
        <div style={{ textAlign: 'right' }}>
            <Space>
                <Button type="primary" htmlType="submit" loading={loading} disabled={loading} onClick={onSubmit}>
                    {isApproved ? 'Approve' : 'Reject'} Request
                </Button>
                <Button type="primary" onClick={handleClose} loading={loading} disabled={loading}>
                    Cancel
                </Button>
            </Space>
        </div>
    </Modal>
}