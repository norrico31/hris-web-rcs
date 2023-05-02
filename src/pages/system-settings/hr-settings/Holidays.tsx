import { useState, useEffect } from "react";
import { Button, Calendar, Col, Form as AntDForm, Row, Divider as AntDDivider, Modal, Space, Input, TimePicker, Select, DatePicker, Switch } from "antd"
import { MdOutlineHolidayVillage } from 'react-icons/md'
import styled from "styled-components"
import dayjs, { Dayjs } from "dayjs"
import { MainHeader, Form, Box, Action, TabHeader, Card, Table } from "../../../components"
import { renderTitle } from "../../../shared/utils/utilities"
import axiosClient, { useAxios } from "../../../shared/lib/axios"
import { useEndpoints } from "../../../shared/constants"
import { IArguments, TableParams, IHoliday, HolidayRes, IHolidayType, IDailyRate } from "../../../shared/interfaces"
import { ColumnsType, TablePaginationConfig } from "antd/es/table";

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
        GET<HolidayRes>(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYS.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const columns: ColumnsType<IHoliday> = [
        {
            title: 'Holiday Name',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Holiday Date',
            key: 'holiday_date',
            dataIndex: 'holiday_date',
        },
        {
            title: 'Holiday Type',
            key: 'holiday_type',
            dataIndex: 'holiday_type',
            render: (_, record) => record.holiday_type?.name
        },
        {
            title: 'Local',
            key: 'is_local',
            dataIndex: 'is_local',
        },
        {
            title: 'Active',
            key: 'is_active',
            dataIndex: 'is_active',
            render: (_, record) => record.is_active == 1 ? 'ACTIVE' : 'INACTIVE'
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: IHoliday) => <Action
                title='Bank Details'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({
            search: str,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function handleDelete(id: string) {
        DELETE(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IHoliday) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Holidays'>
            <TabHeader
                name='bank details'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <HolidaysModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            />
        </Card>
    )
}

type ModalProps = {
    title: string
    selectedData?: IHoliday
    isModalOpen: boolean
    handleCancel: () => void
    fetchData(args?: IArguments): void
}
const { Item: FormItem, useForm } = AntDForm

function HolidaysModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IHoliday>()
    const [lists, setLists] = useState<{ holidayTypes: IHolidayType[]; dailyRates: IDailyRate[] }>({ dailyRates: [], holidayTypes: [] })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData, holiday_date: dayjs(selectedData?.holiday_date, 'YYYY-MM-DD'), is_active: Number(selectedData.is_active) })
        } else {
            form.resetFields(undefined)
        }
        const controller = new AbortController();
        (async () => {
            try {
                const holidayPromise = axiosClient(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.LISTS, { signal: controller.signal })
                const dailyRatePromise = axiosClient(SYSTEMSETTINGS.HRSETTINGS.DAILYRATE.LISTS, { signal: controller.signal })
                const [holidayRes, dailyRateRes] = await Promise.allSettled([holidayPromise, dailyRatePromise]) as any
                setLists({
                    holidayTypes: holidayRes?.value?.data ?? [],
                    dailyRates: dailyRateRes?.value?.data ?? []
                })
            } catch (error) {
                return error
            }
        })()
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: IHoliday) {
        setLoading(true)
        let { description, holiday_date, ...restValues } = values
        holiday_date = dayjs(holiday_date).format('YYYY-MM-DD') as any
        restValues = { ...restValues, holiday_date, ...(description != undefined && { description }) } as any
        let result = selectedData ? PUT(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYS.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Holiday`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Holiday Name"
                name="name"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter holiday name...' />
            </FormItem>
            <FormItem
                label="Holiday Type"
                name="holiday_type_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select placeholder='Select holiday type...' optionFilterProp="children" allowClear showSearch>
                    {lists?.holidayTypes.map((holiday) => (
                        <Select.Option value={holiday.id} key={holiday.id} style={{ color: '#777777' }}>{holiday.name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <Row justify='space-between'>
                <Col span={11}>
                    <FormItem
                        label="Daily Rate"
                        name="daily_rate_id"
                        required
                        rules={[{ required: true, message: '' }]}
                    >
                        <Select placeholder='Select Daily Rate...' optionFilterProp="children" allowClear showSearch>
                            {lists?.dailyRates.map((daily) => (
                                <Select.Option value={daily.id} key={daily.id} style={{ color: '#777777' }}>{daily.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={11}>
                    <FormItem
                        label="Holiday Date"
                        name="holiday_date"
                        required
                        rules={[{ required: true, message: '' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </FormItem>
                </Col>
            </Row>
            <FormItem
                label="Locally Observed?"
                name="is_local"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select placeholder='Enter locally observed...' optionFilterProp="children" showSearch allowClear>
                    <Select.Option value='yes' style={{ color: '#777777' }}>Yes</Select.Option>
                    <Select.Option value='no' style={{ color: '#777777' }}>No</Select.Option>
                </Select>
            </FormItem>
            <FormItem
                label="Active"
                name="is_active"
                valuePropName="checked"
                initialValue={true}
            >
                <Switch />
            </FormItem>
            <FormItem name="description" label="Description">
                <Input.TextArea placeholder='Enter description...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
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