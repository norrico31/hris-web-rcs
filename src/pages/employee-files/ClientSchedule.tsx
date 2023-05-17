import { useState, useEffect } from 'react'
import { Form as AntDForm, Row, Col, DatePicker, Grid, Button, Select } from 'antd'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, IEmployeeClients, ClientScheduleRes, IClient, IClientBranch, ISchedules } from '../../shared/interfaces'
import dayjs from 'dayjs';
import useWindowSize from '../../shared/hooks/useWindowSize'

const { useForm, Item } = AntDForm

const [{ SYSTEMSETTINGS: { HRSETTINGS, CLIENTSETTINGS }, EMPLOYEE201 }] = useEndpoints()
const { GET, PUT, POST } = useAxios()

export default function ClientAndSchedule() {
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()
    const [form] = useForm()
    const [selectedData, setSelectedData] = useState<IEmployeeClients | undefined>(undefined)
    const [list, setList] = useState<{ clients: Array<IClient>; schedules: Array<ISchedules> }>({ clients: [], schedules: [] })
    const { width } = useWindowSize()
    const [clientId, setClientId] = useState('')
    const [clientBranches, setClientBranches] = useState<Array<IClientBranch>>([])
    const [loading, setLoading] = useState(false)

    useEffect(function fetchUserInfo() {
        setClientId(employeeInfo?.employee_clients[0].client_id)
        form.setFieldsValue({
            client_id: employeeInfo?.employee_clients[0].client_id,
            client_branch_id: employeeInfo?.employee_clients[0].client_branch_id,
            client_start_date: dayjs(employeeInfo?.employee_clients[0].client_start_date, 'YYYY-MM-DD'),
            client_end_date: employeeInfo?.employee_clients[0].client_end_date ? dayjs(employeeInfo?.employee_clients[0].client_end_date, 'YYYY-MM-DD') : null,
            is_active: employeeInfo?.employee_clients[0].is_active ?? 'ACTIVE', // TODO
            schedule_id: employeeInfo?.employee_clients[0].schedule_id
        })
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
    }, [employeeInfo])

    useEffect(() => {
        const controller = new AbortController();
        if (clientId) axiosClient(CLIENTSETTINGS.CLIENTBRANCH.LISTS + '?client_id=' + clientId, { signal: controller.signal })
            .then((res) => setClientBranches(res?.data ?? []))


    }, [clientId])

    function onFinish(val: IEmployeeClients) {
        console.log(val)
        // do put route
        let result = selectedData ? PUT(EMPLOYEE201.CLIENTSCHEDULE.PUT + employeeId, { ...val, user_id: employeeId }) : POST(EMPLOYEE201.CLIENTSCHEDULE.POST, { ...val, user_id: employeeId })
        result.then(() => {
            form.resetFields()
            // handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return (
        <Card title='Client And Schedule'>
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
                    <Button type='primary' htmlType='submit' disabled={loading} loading={loading}>Update</Button>
                </Row>
            </Form>
        </Card>
    )
}
