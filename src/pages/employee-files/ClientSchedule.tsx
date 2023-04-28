import { useState, useEffect } from 'react'
import { Form as AntDForm, Row, Col, Input, Grid, Button, Select } from 'antd'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, IEmployeeClients, ClientScheduleRes } from '../../shared/interfaces'
import dayjs from 'dayjs';
import useWindowSize from '../../shared/hooks/useWindowSize'

const { useForm, Item } = AntDForm
const { useBreakpoint } = Grid

const [{ SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()
const { GET } = useAxios()
// TODO
export default function ClientAndSchedule() {
    const { employeeInfo, fetchData } = useEmployeeCtx()
    const [form] = useForm()
    const [selectedData, setSelectedData] = useState<IEmployeeClients | undefined>(undefined)
    const [schedules, setSchedules] = useState<Array<any>>([])
    const { width } = useWindowSize()

    useEffect(function fetchUserInfo() {
        form.setFieldsValue({
            ...employeeInfo,
        })
        const controller = new AbortController();
        (async () => {
            try {
                const schedulePromise = axiosClient(HRSETTINGS.SCHEDULE.LISTS, { signal: controller.signal })
                const [scheduleRes,] = await Promise.allSettled([schedulePromise]) as any
                setSchedules(scheduleRes?.value?.data ?? [])
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
                            rules={[{ required: true, message: 'Please last name!' }]}
                        >
                            <Input placeholder='Enter last name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Client Branch"
                            name="client_branch"
                            required
                            rules={[{ required: true, message: 'Please first name!' }]}
                        >
                            <Input placeholder='Enter first name...' />
                        </Item>
                    </Col>
                </Row>
                <Row justify='center'>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Schedule"
                            name="schedule_id"
                            required
                            rules={[{ required: true, message: 'Please select schedule!' }]}
                        >
                            <Select
                                placeholder='Select schedule'
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {schedules.map((sched) => (
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
