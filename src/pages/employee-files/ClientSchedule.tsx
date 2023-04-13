import { useState, useEffect } from 'react'
import { Form as AntDForm, Row, Col, Input, DatePicker, Button } from 'antd'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, IEmployeeClients, ClientScheduleRes } from '../../shared/interfaces'
import dayjs from 'dayjs';

const { useForm, Item } = AntDForm

const [{ EMPLOYEE201 }] = useEndpoints()
const { GET } = useAxios()

export default function ClientAndSchedule() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const [form] = useForm()
    const [data, setData] = useState<IEmployeeClients[]>([])
    const [selectedData, setSelectedData] = useState<IEmployeeClients | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // useEffect(function fetchUserInfo() {
    //     form.setFieldsValue({
    //         ...employeeInfo,
    //         client_start_date: dayjs(employeeInfo?.birthday, 'YYYY/MM/DD'),
    //         client_end_date: dayjs(employeeInfo?.birthday, 'YYYY/MM/DD'),
    //     })
    // }, [employeeInfo])

    const handleSearch = (str: string) => {
        setSearch(str)
        // fetchData({ search: str, page: 1 })
    }

    function handleDownload() {
        alert('download')
    }

    function onFinish(val: IEmployeeClients) {
        setLoading(true)
        console.log(val)
        // do put route
        setLoading(false)
    }

    // TODO: FORM LIKE IN THE USERPROFILE NOT TABLE
    return (
        <Card title='Client And Schedule'>
            <Form form={form} onFinish={onFinish}>
                <Row justify='space-between'>
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
                <Row justify='space-between'>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="Start Date"
                            name="client_start_date"
                            required
                            rules={[{ required: true, message: 'Please select date of birth!' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format='YYYY/MM/DD'
                            />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                        <Item
                            label="End Date"
                            name="client_end_date"
                            required
                            rules={[{ required: true, message: 'Please select date of birth!' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format='YYYY/MM/DD'
                            />
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
