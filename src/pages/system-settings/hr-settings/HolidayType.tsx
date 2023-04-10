import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Switch } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { HolidayTypeRes, IArguments, TableParams, IHolidayType } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS }] = useEndpoints()

export default function HolidayType() {
    const [data, setData] = useState<IHolidayType[]>([])
    const [selectedData, setSelectedData] = useState<IHolidayType | undefined>(undefined)
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

    const columns: ColumnsType<IHolidayType> = [
        {
            title: 'Holiday Type',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Active',
            key: 'is_active',
            dataIndex: 'is_active',
            render: (_, record) => Number(record.is_active) == 0 ? 'Inactive' : 'Active'
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
            render: (_: any, record: IHolidayType) => <Action
                title='Employee Status'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<HolidayTypeRes>(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.GET, args?.signal!, { page: args?.page!, search: args?.search! })
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

    function handleDelete(id: string) {
        DELETE(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IHolidayType) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Holiday Type'>
            <TabHeader
                name='holiday type'
                handleSearchData={(str: string) => {
                    setSearch(str)
                    fetchData({ search: str, page: 1 })
                }}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                onChange={(pagination: TablePaginationConfig) => {
                    fetchData({ page: pagination?.current, search })
                }}
            />
            <HolidayTypeModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                fetchData={fetchData}
                handleCancel={handleCloseModal}
            />
        </Card>
    )
}


interface ModalProps {
    title: string
    isModalOpen: boolean
    fetchData(args?: IArguments): void
    selectedData?: IHolidayType
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

function HolidayTypeModal({ title, selectedData, isModalOpen, fetchData, handleCancel }: ModalProps) {
    const [form] = useForm<IHolidayType>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData, is_active: Number(selectedData.is_active) })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IHolidayType) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.PUT, { ...restValues, id: selectedData.id }) : POST(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Holiday Type`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Holiday type name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter holiday type name!' }]}
            >
                <Input placeholder='Enter holiday type name...' />
            </FormItem>
            <FormItem
                label="Active"
                name="is_active"
                valuePropName="checked"
                initialValue={true}
            >
                <Switch />
            </FormItem>

            <FormItem
                name="description"
                label="Description"
            >
                <Input placeholder='Enter Description...' />
            </FormItem>

            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" htmlType="submit" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}