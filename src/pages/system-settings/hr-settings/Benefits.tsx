import { useState, useEffect } from 'react'
import { Form as AntDForm, Modal, Input, DatePicker, Space, Button, Select } from 'antd'
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs'
import { TabHeader, Table, Form, Card, Action } from '../../../components'
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { BenefitsRes, IArguments, IBenefits, TableParams } from '../../../shared/interfaces'

const { GET, DELETE, PUT, POST } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

export default function Benefits() {
    const [data, setData] = useState<IBenefits[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IBenefits | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IBenefits> = [
        {
            title: 'Benefit',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
        },
        // {
        //     title: 'Schedule',
        //     key: 'schedule',
        //     dataIndex: 'schedule',
        // },
        {
            title: 'Status',
            key: 'is_active',
            dataIndex: 'is_active',
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
            render: (_: any, record: IBenefits) => <Action
                title='Bank Details'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function handleDelete(id: string) {
        DELETE(HRSETTINGS.BENEFITS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IBenefits) {
        setIsModalOpen(true)
        setSelectedData(data)
    }
    const fetchData = (args?: IArguments) => {
        GET<BenefitsRes>(HRSETTINGS.BENEFITS.GET, args?.signal!, { page: args?.page!, search: args?.search! })
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

    function handleDownload() {
        alert('download')
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Benefits'>
            <TabHeader
                name='benefits'
                handleSearchData={() => null}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={handleDownload}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <BenefitsModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
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
    isModalOpen: boolean
    selectedData?: IBenefits
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: Item, useForm } = AntDForm

function BenefitsModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IBenefits>()

    useEffect(() => {
        if (selectedData != undefined) {
            // let date = [dayjs(selectedData?.start_date, 'YYYY/MM/DD'), dayjs(selectedData?.end_date, 'YYYY/MM/DD')]
            form.setFieldsValue({
                ...selectedData,
                // date: date
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IBenefits) {
        let { description, ...restValues } = values
        // let [start_date, end_date] = date
        // start_date = dayjs(start_date).format('YYYY/MM/DD')
        // end_date = dayjs(end_date).format('YYYY/MM/DD')

        // TODO: for_payroll_calculation
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(HRSETTINGS.BENEFITS.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(HRSETTINGS.BENEFITS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Benefit`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} >
            <Item
                label="Benefit"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter benefit!' }]}
            >
                <Input placeholder='Enter benefit...' />
            </Item>
            <Item
                label="Amount"
                name="amount"
                required
                rules={[{ required: true, message: 'Please amount!' }]}
            >
                <Input type='number' placeholder='Enter amount...' />
            </Item>
            {/* <Item
                label="Start and End Date"
                name="date"
                required
                rules={[{ required: true, message: 'Please select date!' }]}
            >
                <DatePicker
                    style={{ width: '100%' }}
                    format='YYYY/MM/DD'
                />
            </Item> */}
            <Item
                label="Status"
                name="is_active"
                required
                rules={[{ required: true, message: 'Please select status!' }]}
            >
                <Select
                    placeholder='Select status...'
                >
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
            </Item>
            <Item
                name="description"
                label="Description"
            >
                <Input placeholder='Enter description...' />
            </Item>
            <Item style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}