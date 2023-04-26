import { useState, useEffect } from "react"
import { Button, Col, DatePicker, Form as AntDForm, Input, Modal, Select, Space } from "antd"
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { AiOutlineCalendar } from 'react-icons/ai'
import { Action, MainHeader, Table, Form } from "../components"
import { renderTitle } from "../shared/utils/utilities"
import dayjs from "dayjs"
import { useAxios } from "../shared/lib/axios"
import { useEndpoints } from "../shared/constants"
import { IArguments, TableParams } from "../shared/interfaces"

interface ISalaryAdjustment extends Partial<{ id: string }> {
    task_activity: string[]
    task_type: string[]
    sprint_name: string[]
    manhours: string
    date: string
    description: string;
}

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SALARYADJUSTMENT }] = useEndpoints()

export default function SalaryAdjustment() {
    renderTitle('Salary Adjustment')
    const [data, setData] = useState<ISalaryAdjustment[]>([])
    const [selectedData, setSelectedData] = useState<ISalaryAdjustment | undefined>(undefined)
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

    const columns: ColumnsType<ISalaryAdjustment> = [
        {
            title: 'Employee Name',
            key: 'employee_name',
            dataIndex: 'employee_name',
        },
        {
            title: 'Adjustment Type',
            key: 'adjustment_type_id',
            dataIndex: 'adjustment_type_id',
        },
        {
            title: 'Adjustment Date',
            key: 'adjustment_date',
            dataIndex: 'adjustment_date',
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
            align: 'center',
        },
        {
            title: 'Remarks',
            key: 'remarks',
            dataIndex: 'remarks',
            align: 'center',
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
            render: (_, record: ISalaryAdjustment) => <Action
                title='Tasks'
                name={record.task_activity[0]}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<any>(SALARYADJUSTMENT.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(SALARYADJUSTMENT.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ISalaryAdjustment) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleDownload() {
        console.log('dowwnload')
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }
    return (
        <>
            <MainHeader>
                <Col>
                    <h1 className='color-white'>Salary Adjustment</h1>
                </Col>
                <Col>
                    <Button className="btn-timeinout" size="large" onClick={() => setIsModalOpen(true)}>
                        Create
                        <AiOutlineCalendar />
                    </Button>
                </Col>
            </MainHeader>
            <Table columns={columns} dataList={data} />
            <SalaryAdjustmentModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
            />
        </>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ISalaryAdjustment
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function SalaryAdjustmentModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<ISalaryAdjustment>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
                date: dayjs(selectedData.date, 'YYYY/MM/DD') as any
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ISalaryAdjustment) {
        // if success
        let { date, description, ...restProps } = values
        date = dayjs(date, 'YYYY/MM/DD') as any
        restProps = { ...restProps, date, ...(description != undefined && { description }) } as any
        console.log(restProps)
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Adjustment`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Employee Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter employee name!' }]}
            >
                <Select
                    // defaultValue={defaultVal}
                    placeholder='Select employee'
                >
                    <Select.Option value="demo">Demo</Select.Option>
                </Select>
            </FormItem>
            <FormItem
                name='adjustment_type_id'
                label="Adjustment Type"
                required rules={[{ required: true, message: 'Please select adjustment type!' }]}
            >
                <Select
                    // defaultValue={defaultVal}
                    placeholder='Select adjustment type'
                >
                    <Select.Option value="demo">Demo</Select.Option>
                </Select>
            </FormItem>
            <FormItem
                label="Adjustment Date"
                name="adjustment_date"
                required
                rules={[{ required: true, message: 'Please select adjustment date!' }]}
            >
                <DatePicker
                    format='YYYY/MM/DD'
                    style={{ width: '100%' }}
                />
            </FormItem>
            <FormItem name='amount' label="Amount" required rules={[{ required: true, message: 'Please enter amount!' }]}>
                <Input type='number' placeholder="Enter amount..." />
            </FormItem>
            <FormItem
                name="remarks"
                label="Remarks"
                required
                rules={[{ required: true, message: 'Please enter remarks!' }]}
            >
                <Input.TextArea placeholder='Enter remarks...' />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input.TextArea placeholder='Enter description...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button id={selectedData != undefined ? 'Update' : 'Create'} type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button id='cancel' type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}