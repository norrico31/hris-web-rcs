import { useState, useEffect, useMemo } from 'react'
import { Space, Button, Input, Form as AntDForm, Select, Popconfirm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../components"
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'
import { IArguments, IUser, UserRes, TableParams, IRole, IDepartment, ILineManager } from '../../shared/interfaces'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ ADMINSETTINGS, SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

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
            // TODO FILTERING
            title: 'Role',
            key: 'role',
            dataIndex: 'role',
            render: (_, record) => record?.role?.name ?? '-'
        },
        {
            // TODO FILTERING
            title: 'Department',
            key: 'department',
            dataIndex: 'department',
            render: (_, record) => record?.department?.name ?? '-'
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
        {
            title: 'Activation',
            key: 'activation',
            dataIndex: 'activation',
            align: 'center',
            render: (_: any, record: IUser) => <Popconfirm
                title={`${!record?.is_active ? 'Activate' : 'Deactivate'} User`}
                description={`Are you sure you want to ${!record?.is_active ? 'activate' : 'deactivate'} ${record?.full_name}?`}
                onConfirm={() => {
                    const urlActivate = record?.is_active ? ADMINSETTINGS.USERS.DEACTIVATE : ADMINSETTINGS.USERS.ACTIVATE
                    userActivation(urlActivate, record?.id)
                }}
                okText={!record?.is_active ? 'Activate' : 'Deactivate'}
                cancelText="Cancel"
            >
                <Button type={record?.is_active ? 'default' : 'primary'}>{!record?.is_active ? 'Activate' : 'Deactivate'}</Button>
            </Popconfirm>
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
                console.log('USER ACTIVATION: ', res)
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
    const [roleId, setRoleId] = useState('')
    const [lists, setLists] = useState<{ roles: IRole[]; departments: IDepartment[]; manager: ILineManager[] }>({ roles: [], departments: [], manager: [] })

    const isManagerRole = useMemo(() => {
        const managers: Record<string, IRole> = lists?.roles.reduce((roles, role) => ({ ...roles, [role.id]: role }), {})
        return managers[roleId]?.name.toLocaleLowerCase()
    }, [roleId])

    console.log(isManagerRole)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
        const controller = new AbortController();
        const rolePromise = axiosClient(ADMINSETTINGS.ROLES.LISTS, { signal: controller.signal })
        const departmentPromise = axiosClient(HRSETTINGS.DEPARTMENT.LISTS, { signal: controller.signal })
        const lineManagerPromise = axiosClient(ADMINSETTINGS.ROLES.LINEMANAGERS, { signal: controller.signal })
        Promise.allSettled([rolePromise, departmentPromise, lineManagerPromise])
            .then(([roleRes, departRes, managerRes]) => {
                setLists({
                    roles: roleRes?.status == 'fulfilled' ? roleRes?.value?.data : [],
                    departments: departRes?.status == 'fulfilled' ? departRes?.value?.data : [],
                    manager: managerRes?.status == 'fulfilled' ? managerRes?.value?.data : [],
                })
            })
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
                    value={roleId}
                    onChange={setRoleId}
                >
                    {lists.roles.map((role) => (
                        <Select.Option key={role?.id} value={role?.id}>{role?.name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            {isManagerRole == 'line manager' && (
                <FormItem
                    label="Manager"
                    name="manager_id"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Select
                        placeholder='Select line manager...'
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {lists?.manager.map((manager) => (
                            <Select.Option value={manager.id} key={manager.id} style={{ color: '#777777' }}>{manager.full_name}</Select.Option>
                        ))}
                    </Select>
                </FormItem>
            )}
            <FormItem
                label="Department"
                name="department_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select
                    optionFilterProp="children"
                    allowClear
                    showSearch
                    placeholder='Select a Department'
                >
                    {lists.departments.map((dep) => (
                        <Select.Option key={dep?.id} value={dep?.id}>{dep?.name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            {/* <FormItem
                name="description"
                label="Description"
            >
                <Input placeholder='Enter Description...' />
            </FormItem> */}
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