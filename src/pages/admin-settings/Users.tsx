import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Select } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../components"
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'
import { IArguments, IUser, UserRes, TableParams, IRole } from '../../shared/interfaces'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

export default function Users() {
    const [data, setData] = useState<IUser[]>([])
    const [selectedData, setSelectedData] = useState<IUser | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IUser> = [
        {
            title: 'User',
            key: 'full_name',
            dataIndex: 'full_name',
        },
        {
            title: 'Email',
            key: 'email',
            dataIndex: 'email',
        },
        {
            title: 'Role',
            key: 'role',
            dataIndex: 'role',
        },
        {
            title: 'Department',
            key: 'department',
            dataIndex: 'department',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: IUser) => <Action
                title='User'
                name={record.full_name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<UserRes>(ADMINSETTINGS.USERS.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({
            search: str,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function userActivation(url: string, id: string) {
        PUT(url + id, {})
            .then((res) => {
                console.log(res)
            })
            .finally(fetchData)
    }

    function handleDelete(id: string) {
        DELETE(ADMINSETTINGS.USERS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IUser) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='User Management'>
            <TabHeader
                name='user'
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
            <UserModal
                title={selectedData != undefined ? 'Update' : 'Create'}
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
    selectedData?: IUser
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function UserModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IUser>()
    const [loading, setLoading] = useState(false)
    const [roles, setRoles] = useState<IRole[]>([])

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
        const controller = new AbortController()
        axiosClient(ADMINSETTINGS.ROLES.LISTS, { signal: controller.signal })
            .then((res) => {
                setRoles(res?.data ?? [])
            });
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: IUser) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(ADMINSETTINGS.USERS.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(ADMINSETTINGS.USERS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - User`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="First Name"
                name="first_name"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter first name...' />
            </FormItem>
            <FormItem
                label="Middle Name"
                name="middle_name"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter middle name...' />
            </FormItem>
            <FormItem
                label="Last Name"
                name="last_name"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter last name...' />
            </FormItem>
            <FormItem
                label="Email Address"
                name="email"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input type='email' placeholder='Enter email address...' />
            </FormItem>
            <FormItem
                label="Role"
                name="role_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select
                    optionFilterProp="children"
                    allowClear
                    showSearch
                    placeholder='Select a Role'
                >
                    {roles.map((r) => (
                        <Select.Option key={r?.id} value={r?.id}>{r?.name}</Select.Option>
                    ))}
                </Select>
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