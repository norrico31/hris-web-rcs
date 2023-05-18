import { useState, useEffect } from 'react'
import { Form as AntDForm, Row, Col, DatePicker, Grid, Button, Select, Modal } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { Action, Card, TabHeader, Table } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, IEmployeeClients, IClient, IClientBranch, ISchedules } from '../../shared/interfaces'
import dayjs from 'dayjs';
import useWindowSize from '../../shared/hooks/useWindowSize'

const { useForm, Item } = AntDForm

const [{ SYSTEMSETTINGS: { HRSETTINGS, CLIENTSETTINGS }, EMPLOYEE201 }] = useEndpoints()
const { GET, PUT, POST, DELETE } = useAxios()

export default function ClientAndSchedule() {
    const { employeeInfo, fetchData } = useEmployeeCtx()
    const [selectedData, setSelectedData] = useState<IEmployeeClients | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    const columns: ColumnsType<IEmployeeClients> = [
        {
            title: 'Client',
            key: 'client.name',
            dataIndex: 'client.name',
            render: (_, record) => record.client?.name,
            width: 130
        },
        {
            title: 'Client Branch',
            key: 'client.branc',
            dataIndex: 'client.branc',
            render: (_, record) => record.branch_name?.branch_name,
            width: 130
        },
        {
            title: 'Client Start Date',
            key: 'client_start_date',
            dataIndex: 'client_start_date',
            width: 130
        },
        {
            title: 'Client End Date',
            key: 'client_end_date',
            dataIndex: 'client_end_date',
            width: 130
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: IEmployeeClients) => <Action
                title='Tasks'
                name={record.client?.name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />,
            width: 150
        },
    ]

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({
            search: str,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
    }

    function handleDelete(id: string) {
        DELETE(EMPLOYEE201.CLIENTSCHEDULE.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IEmployeeClients) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Client And Schedule'>
            <TabHeader
                handleSearch={handleSearch} // TODO SEARCH ENDPOINT 
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={employeeInfo?.employee_clients ?? []}
                tableParams={tableParams}
                onChange={onChange}
            />
            <ClientScheduleModal
                title={selectedData ? 'Update' : 'Submit'}
                isModalOpen={isModalOpen}
                employeeId={employeeInfo?.id}
                selectedData={selectedData}
                fetchData={fetchData}
                handleClose={handleCloseModal}
            />
        </Card>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    employeeId: string
    selectedData?: IEmployeeClients
    fetchData: (args?: IArguments) => void
    handleClose: () => void
}

function ClientScheduleModal(props: ModalProps) {
    const { title, employeeId, isModalOpen, selectedData, handleClose, fetchData } = props
    const [form] = useForm()
    const [loading, setLoading] = useState(false)
    const { width } = useWindowSize()
    const [list, setList] = useState<{ clients: Array<IClient>; schedules: Array<ISchedules> }>({ clients: [], schedules: [] })
    const [clientId, setClientId] = useState('')
    const [clientBranches, setClientBranches] = useState<Array<IClientBranch>>([])

    useEffect(function fetchUserInfo() {
        if (selectedData) {
            setClientId(selectedData?.client_id!)
            form.setFieldsValue({
                client_id: selectedData?.client_id,
                client_branch_id: selectedData?.client_branch_id,
                client_start_date: dayjs(selectedData?.client_start_date, 'YYYY-MM-DD'),
                client_end_date: selectedData?.client_end_date ? dayjs(selectedData?.client_end_date, 'YYYY-MM-DD') : null,
                is_active: selectedData?.is_active ?? 'ACTIVE', // TODO
                schedule_id: selectedData?.schedule_id
            })
        } else {
            form.resetFields()
        }

        const controller = new AbortController();
        (async () => {
            try {
                const schedulePromise = axiosClient(HRSETTINGS.SCHEDULES.LISTS, { signal: controller.signal })
                const clientPromise = axiosClient(CLIENTSETTINGS.CLIENT.LISTS, { signal: controller.signal })
                // const clientBranchPromise = axiosClient(CLIENTSETTINGS.CLIENTBRANCH.LISTS, { signal: controller.signal })
                const [scheduleRes, clientRes] = await Promise.allSettled([schedulePromise, clientPromise]) as any
                setList({
                    schedules: scheduleRes?.value?.data ?? [],
                    clients: clientRes?.value?.data ?? []
                })
            } catch (error) {
                console.error('error fetching clients: ', error)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [selectedData])

    useEffect(() => {
        const controller = new AbortController();
        if (clientId) axiosClient(CLIENTSETTINGS.CLIENTBRANCH.LISTS + '?client_id=' + clientId, { signal: controller.signal })
            .then((res) => setClientBranches(res?.data ?? []));
        return () => {
            controller.abort()
        }
    }, [clientId])

    function onFinish({ client_start_date, client_end_date, ...restValues }: IEmployeeClients) {
        // do put route
        client_start_date = dayjs(client_start_date).format("YYYY-MM-DD")
        client_end_date = dayjs(client_end_date).format("YYYY-MM-DD")
        let result = selectedData ? PUT(EMPLOYEE201.CLIENTSCHEDULE.PUT + employeeId, { ...restValues, client_start_date, client_end_date, user_id: employeeId }) : POST(EMPLOYEE201.CLIENTSCHEDULE.POST, { ...restValues, client_start_date, client_end_date, user_id: employeeId })
        result.then(() => {
            form.resetFields()
            handleClose()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return (
        <Modal title={`Client and Schedule - ${title}`} open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
            <Form form={form} onFinish={onFinish} disabled={loading}>
                <Row justify={width >= 991 ? 'space-between' : 'center'}>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Client"
                            name="client_id"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Select
                                placeholder='Select client'
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                value={clientId}
                                onChange={(id) => {
                                    if (id == undefined || id == '') {
                                        setClientBranches([])
                                        setClientId('')
                                        form.setFieldsValue({ ...form.getFieldsValue(), client_branch_id: null })
                                    }
                                    setClientId(id)
                                }}
                            >
                                {list.clients.map((client) => (
                                    <Select.Option value={client.id} key={client.id}>{client.name}</Select.Option>
                                ))}
                            </Select>
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Client Branch"
                            name="client_branch_id"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Select
                                placeholder='Select client branch'
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                disabled={!clientBranches.length}
                            >
                                {clientBranches.map((client) => (
                                    <Select.Option value={client.id} key={client.id}>{client.branch_name}</Select.Option>
                                ))}
                            </Select>
                        </Item>
                    </Col>
                </Row>
                <Row justify={width >= 991 ? 'space-between' : 'center'} wrap>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Effectivity Start Schedule"
                            name="client_start_date"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Effectivity End Schedule"
                            name="client_end_date"
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Item>
                    </Col>
                </Row>
                <Row justify={width >= 991 ? 'space-between' : 'center'} wrap>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Status"
                            name="is_active"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Select
                                placeholder='Select status...'
                            >
                                <Select.Option value="active">Active</Select.Option>
                                <Select.Option value="inactive">Inactive</Select.Option>
                            </Select>
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Schedule"
                            name="schedule_id"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Select
                                placeholder='Select schedule'
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {list.schedules.map((sched) => (
                                    <Select.Option value={sched.id} key={sched.id}>{sched.name}</Select.Option>
                                ))}
                            </Select>
                        </Item>
                    </Col>
                </Row>
                <Row justify='end'>
                    <Button type='primary' htmlType='submit' disabled={loading} loading={loading}>{title}</Button>
                </Row>
            </Form>
        </Modal>
    )
}