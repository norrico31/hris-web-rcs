import { useState, useEffect } from 'react'
import { Form as AntDForm, Row, Col, DatePicker, Grid, Button, Select } from 'antd'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, IEmployeeClients, ClientScheduleRes, IClient, IClientBranch } from '../../shared/interfaces'
import dayjs from 'dayjs';
import useWindowSize from '../../shared/hooks/useWindowSize'

const { useForm, Item } = AntDForm
const { useBreakpoint } = Grid

const [{ SYSTEMSETTINGS: { HRSETTINGS, CLIENTSETTINGS }, }] = useEndpoints()
const { GET } = useAxios()
// TODO
export default function ClientAndSchedule() {
    const { employeeInfo, fetchData } = useEmployeeCtx()
    const [form] = useForm()
    const [selectedData, setSelectedData] = useState<IEmployeeClients | undefined>(undefined)
    const [list, setList] = useState<{ clients: Array<IClient>; clientBranches: Array<IClientBranch>; schedules: Array<any> }>({ clients: [], clientBranches: [], schedules: [] })
    const { width } = useWindowSize()
    console.log(list)
    useEffect(function fetchUserInfo() {
        form.setFieldsValue({
            ...employeeInfo,
        })
        const controller = new AbortController();
        (async () => {
            try {
                const schedulePromise = axiosClient(HRSETTINGS.SCHEDULES.LISTS, { signal: controller.signal })
                const clientPromise = axiosClient(CLIENTSETTINGS.CLIENT.LISTS, { signal: controller.signal })
                const clientBranchPromise = axiosClient(CLIENTSETTINGS.CLIENTBRANCH.LISTS, { signal: controller.signal })
                const [scheduleRes, clientRes, clientBranchRes] = await Promise.allSettled([schedulePromise, clientPromise, clientBranchPromise]) as any
                setList({
                    schedules: scheduleRes?.value?.data ?? [],
                    clientBranches: clientBranchRes?.value?.data ?? [],
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

    function onFinish(val: IEmployeeClients) {
        console.log(val)
        // do put route
    }

    return (
        <Card title='Client And Schedule'>
            <Form form={form} onFinish={onFinish}>
                <Row justify={width >= 991 ? 'space-between' : 'center'}>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Client"
                            name="client"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Select
                                placeholder='Select client'
                                allowClear
                                showSearch
                                optionFilterProp="children"
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
                            name="client_branch"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Select
                                placeholder='Select client branch'
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {list.clientBranches.map((client) => (
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
                            name="schedule_id"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Effectivity End Schedule"
                            name="schedule_id"
                        // required
                        // rules={[{ required: true, message: 'Please select schedule!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Item>
                    </Col>
                </Row>
                <Row justify='center'>
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
                                    <Select.Option value={sched.id} key={sched.id}>{sched.full_name}</Select.Option>
                                ))}
                            </Select>
                        </Item>
                    </Col>
                </Row>
                <Row justify='end'>
                    <Button type='primary' htmlType='submit'>Update</Button>
                </Row>
            </Form>
        </Card>
    )
}
