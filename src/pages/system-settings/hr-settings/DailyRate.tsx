import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { DailyRateRes, IArguments, IDailyRate, TableParams } from '../../../shared/interfaces'
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

export default function DailyRate() {
    const [data, setData] = useState<IDailyRate[]>([])
    const [selectedData, setSelectedData] = useState<IDailyRate | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IDailyRate> = [
        {
            title: 'Daily Rate Code',
            key: 'code',
            dataIndex: 'code',
        },
        {
            title: 'Daily Rate Name',
            key: 'bank_branch',
            dataIndex: 'bank_branch',
        },
        {
            title: 'Daily rate per Hour',
            key: 'rate_per_hour',
            dataIndex: 'rate_per_hour',
        },
        {
            title: 'Overtime Rate per Hour',
            key: 'overtime_rate',
            dataIndex: 'overtime_rate',
        },
        {
            title: 'Night Differential Overtime Rate per Hour',
            key: 'night_overtime_rate',
            dataIndex: 'night_overtime_rate',
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
            render: (_: any, record: IDailyRate) => <Action
                title='Bank Details'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        GET<DailyRateRes>(HRSETTINGS.DAILYRATE.GET, args?.signal!, { page: args?.page!, search: args?.search! })
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
            })
    }

    function handleDelete(id: string) {
        DELETE(HRSETTINGS.DAILYRATE.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IDailyRate) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Daily Rates'>
            <TabHeader
                name='daily rate'
                handleSearchData={() => null}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <DailyRateModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            />
        </Card>
    )
}


interface ModalProps {
    title: string
    isModalOpen: boolean
    selectedData?: IDailyRate
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function DailyRateModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IDailyRate>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IDailyRate) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(HRSETTINGS.BENEFITS.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(HRSETTINGS.BENEFITS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Daily Rate`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Daily Rate Code"
                name="code"
                required
                rules={[{ required: true, message: 'Please enter code!' }]}
            >
                <Input placeholder='Enter code...' />
            </FormItem>
            <FormItem
                label="Daily Rate Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter daily rate name!' }]}
            >
                <Input placeholder='Enter daily rate name...' />
            </FormItem>

            <FormItem
                name="Daily rate per Hour"
                label="rate"
            >
                <Input type='number' placeholder='Enter rate...' />
            </FormItem>
            <FormItem
                name="Overtime Rate per Hour"
                label="overtime"
            >
                <Input type='number' placeholder='Enter overtime rate hour...' />
            </FormItem>
            <FormItem
                name="Night Differential Overtime Rate per Hour"
                label="overtime"
            >
                <Input type='number' placeholder='Enter overtime rate hour...' />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input.TextArea placeholder='Enter Description...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}