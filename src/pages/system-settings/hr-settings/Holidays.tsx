import { useState, useEffect } from "react";
import { Button, Calendar, Col, Form as AntDForm, Row, Divider as AntDDivider, Modal, Space, Input, TimePicker, Select } from "antd"
import { MdOutlineHolidayVillage } from 'react-icons/md'
import styled from "styled-components"
import dayjs, { Dayjs } from "dayjs"
import { MainHeader, Form, Box, Action, TabHeader, Card } from "../../../components"
import { renderTitle } from "../../../shared/utils/utilities"
import { useAxios } from "../../../shared/lib/axios"
import { useEndpoints } from "../../../shared/constants"
import { IArguments, TableParams, IHoliday, HolidayRes } from "../../../shared/interfaces"

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS }] = useEndpoints()

export default function Holidays() {
    renderTitle('Holidays')
    const [data, setData] = useState<IHoliday[]>([])
    const [selectedData, setSelectedData] = useState<IHoliday | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<HolidayRes>(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYS.GET, args?.signal!, { page: args?.page!, search: args?.search! })
            .then((res) => {
                setData(res?.data ?? [])
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res?.total,
                        current: res?.current_page,
                    },
                })
            }).finally(() => setLoading(false))
    }

    const onPanelChange = (value: Dayjs) => {
        console.log(value.format('YYYY-MM-DD'));
    }

    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: IHoliday) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    const currentDay = dayjs().format('dddd')
    const currentDate = dayjs().format('MMMM DD')

    return (
        <Card title='Holidays'>
            <TabHeader
                name='holiday type'
                // handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Row justify='space-around' wrap>
                <Col1 xs={24} sm={24} md={14} lg={14} xl={14}>
                    <Calendar onPanelChange={onPanelChange} />
                </Col1>
                <Col2 xs={24} sm={24} md={9} lg={9} xl={8} height={700} style={{ overflowX: 'auto' }}>
                    <h2 style={{ color: '#ABABAB' }}>List of holidays for this month</h2>
                    <div>
                        <AntDDivider />
                        <Box title="New Year's Day">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p>January 01, 2023</p>
                                {/* <Action
                                    title='Employee Status'
                                    name='Aha'
                                    onConfirm={() => { }}
                                    onClick={() => { }}
                                /> */}
                            </div>
                        </Box>
                    </div>
                    <div>
                        <AntDDivider />
                        <Box title="New Year's Day">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p>January 01, 2023</p>
                                {/* <Action
                                    title='Employee Status'
                                    name='Aha'
                                    onConfirm={() => { }}
                                    onClick={() => { }}
                                /> */}
                            </div>
                        </Box>
                    </div>
                    {/* <AntDDivider />
                    <Box title="Time in">
                        <p>January 01, 2023</p>
                    </Box>
                    <AntDDivider />
                    <Box title="Time in">
                        <p>January 01, 2023</p>
                    </Box>
                    <AntDDivider />
                    <Box title="Time in">
                        <p>January 01, 2023</p>
                    </Box> */}
                    {/* <AntDDivider />
                    <Box title="Time out">
                        <b>06:44 PM</b>
                        <p>March 22</p>
                    </Box> */}
                </Col2>
            </Row>
            <HolidaysModal
                isModalOpen={isModalOpen}
                handleClose={() => setIsModalOpen(false)}
            />
        </Card>
    )
}

type ModalProps = {
    isModalOpen: boolean
    handleClose: () => void
}
const { Item: FormItem, useForm } = AntDForm

function HolidaysModal({ isModalOpen, handleClose }: ModalProps) {
    const [form] = useForm<any>()

    function onFinish(values: any) {
        // if success
        let { description, ...restProps } = values
        // date = dayjs(date, 'YYYY/MM/DD') as any
        restProps = { ...restProps, ...(description != undefined && { description }) } as any
        console.log(restProps)
        form.resetFields()
        handleClose()
    }

    return <Modal title='Create Holiday' open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} initialValues={{ time_in: dayjs('08:00:00', 'HH:mm:ss'), time_out: dayjs('05:00:00', 'HH:mm:ss') }}>
            <FormItem
                label="Holiday Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter holiday name!' }]}
            >
                <Input placeholder='Enter holiday name...' />
            </FormItem>
            <FormItem
                label="Holiday Type"
                name="holiday_type"
                required
                rules={[{ required: true, message: 'Please enter holiday type!' }]}
            >
                <Select placeholder='Enter holiday type...'>
                </Select>
            </FormItem>
            <Row justify='space-between'>
                <Col span={11}>
                    <FormItem
                        label="Daily Rate"
                        name="rate"
                        required
                        rules={[{ required: true, message: 'Please enter daily rate!' }]}
                    >
                        <Input type='number' placeholder='Enter daily rate...' />
                    </FormItem>
                </Col>
                <Col span={11}>
                    <FormItem
                        label="Holiday Date"
                        name="date"
                        required
                        rules={[{ required: true, message: 'Please select holiday date!' }]}
                    >
                        <TimePicker style={{ width: '100%' }} />
                    </FormItem>
                </Col>
            </Row>
            <FormItem
                label="Locally Observed?"
                name="observed"
                required
                rules={[{ required: true, message: 'Please locally observed!' }]}
            >
                <Select placeholder='Enter locally observed...'>
                </Select>
            </FormItem>
            <FormItem name="description" label="Description">
                <Input.TextArea placeholder='Enter description...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        Create
                    </Button>
                    <Button type="primary" htmlType="submit" onClick={handleClose}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}

interface ICol {
    height: number
}

export const Col1 = styled(Col)`
    border: 1px solid #E5E5E5;
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.09), 0 6px 6px rgba(0,0,0,0.15);
`

export const Col2 = styled(Col) <ICol>`
    border: 1px solid #E5E5E5;
    padding: 1.5rem !important;
    max-height: ${(props) => props.height + 'px'};
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.09), 0 6px 6px rgba(0,0,0,0.15);
`