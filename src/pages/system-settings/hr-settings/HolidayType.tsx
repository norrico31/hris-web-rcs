import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Switch, Popconfirm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { BiRefresh } from 'react-icons/bi'
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
    const [isArchive, setIsArchive] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function () {
        const controller = new AbortController();
        fetchData({
            signal: controller.signal,
            search,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize,
            isArchive
        })
        return () => {
            controller.abort()
        }
    }, [isArchive, search])

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
            render: (_: any, record: IHolidayType) => !isArchive ? <Action
                title='holiday type'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            /> : <Popconfirm
                title={`Restore holiday types`}
                description={`Are you sure you want to restore ${record?.name}?`}
                onConfirm={() => {
                    GET(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.RESTORE + record?.id)
                        .then((res) => console.log(res))
                        .finally(() => fetchData({
                            search,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize,
                            isArchive
                        }))
                }}
                okText="Restore"
                cancelText="Cancel"
            >
                <Button id='restore' type='primary' size='middle' onClick={() => null}>
                    <Space align='center'>
                        <BiRefresh />
                        Restore
                    </Space>
                </Button>
            </Popconfirm>,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        let url = args?.isArchive ? (SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.GET + '/archives') : SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.GET;
        GET<HolidayTypeRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize!, isArchive })

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
        <Card title={`Holiday Types ${isArchive ? '- Archives' : ''}`}>
            <TabHeader
                handleSearch={setSearch}
                handleCreate={!isArchive ? () => setIsModalOpen(true) : undefined}
                handleModalArchive={!isArchive ? () => setIsArchive(true) : undefined}
            >
                {isArchive ? <Button onClick={() => setIsArchive(false)}>Back to holiday types</Button> : null}
            </TabHeader>
            {!isArchive ? (
                <>
                    <Table
                        loading={loading}
                        columns={columns}
                        dataList={data}
                        tableParams={tableParams}
                        onChange={onChange}
                    />
                    <HolidayTypeModal
                        title={selectedData != undefined ? 'Update' : 'Create'}
                        selectedData={selectedData}
                        isModalOpen={isModalOpen}
                        handleCancel={handleCloseModal}
                        fetchData={fetchData}
                    />
                </>
            ) : (<Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />)}
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
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData, is_active: Number(selectedData.is_active) })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IHolidayType) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(SYSTEMSETTINGS.HRSETTINGS.HOLIDAYTYPES.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Holiday Type`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Holiday type name"
                name="name"
                required
                rules={[{ required: true, message: 'Required' }]}
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