import { useState, useEffect, useMemo } from 'react'
import { Navigate, NavigateFunction, useNavigate } from 'react-router-dom'
import { Space, Button, Input, Form as AntDForm, Popconfirm, Row, Modal, Checkbox, Typography, Skeleton } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { BiRefresh } from 'react-icons/bi'
import { BsFillTrashFill, BsEye } from 'react-icons/bs'
import useMessage from 'antd/es/message/useMessage'
import { useAuthContext } from '../../shared/contexts/Auth'
import { Table, TabHeader, Form } from "../../components"
import { useAxios } from '../../shared/lib/axios'
import { ADMINSETTINGSPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, IRole, RoleRes, TableParams } from '../../shared/interfaces'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()
const { Title } = Typography

export default function Roles() {
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<IRole[]>([])
    const navigate = useNavigate()
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isArchive, setIsArchive] = useState(false)
    const [messageApi, contextHolder] = useMessage()
    const key = 'error'

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ADMINSETTINGSPATHS), [user])

    useEffect(function () {
        if (!loadingUser && !codes['ib01']) return
        const controller = new AbortController();
        fetchData({
            signal: controller.signal,
            search,
            page: isArchive ? 1 : (tableParams?.pagination?.current ?? 1),
            pageSize: tableParams?.pagination?.pageSize,
            isArchive
        })
        return () => {
            controller.abort()
        }
    }, [isArchive, search, loadingUser])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['ib01']) return <Navigate to={'/' + paths[0]} />

    const columns: ColumnsType<IRole> = [
        {
            title: 'Role',
            key: 'name',
            dataIndex: 'name',
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
            render: (_: any, record: IRole) => !isArchive ? <Space key={record.id}>
                <Button
                    id='edit'
                    type='default'
                    size='middle'
                    onClick={() => navigate('/roles/' + record.id + '/permissions')}
                    className='btn-edit'
                >
                    <Row align='middle' style={{ gap: 5 }}>
                        <p style={{ color: '#fff' }}>View</p>
                        <BsEye color='white' />
                    </Row>
                </Button>
                <Popconfirm
                    title={`Delete the ${record?.name}`}
                    description={`Are you sure you want to delete ${name}?`}
                    onConfirm={() => handleDelete(record?.id)}
                    okText="Delete"
                    cancelText="Cancel"
                >
                    <Button id='delete' type='primary' size='middle'>
                        <BsFillTrashFill />
                    </Button>
                </Popconfirm>
            </Space> : <Popconfirm
                title={`Restore roles`}
                description={`Are you sure you want to restore ${record?.name}?`}
                onConfirm={() => {
                    GET(ADMINSETTINGS.ROLES.RESTORE + record?.id)
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
        let url = args?.isArchive ? (ADMINSETTINGS.ROLES.GET + '/archives') : ADMINSETTINGS.ROLES.GET;
        GET<RoleRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize!, isArchive })

    function handleDelete(id: string) {
        DELETE(ADMINSETTINGS.ROLES.DELETE, id)
            .catch((err) => {
                messageApi.open({
                    key,
                    type: 'error',
                    content: err?.response?.data?.message,
                    duration: 3
                })
            })
            .finally(() => fetchData({
                search,
                page: tableParams?.pagination?.current ?? 1,
                pageSize: tableParams?.pagination?.pageSize,
                isArchive
            }))
    }

    function handleCloseModal() {
        setIsModalOpen(false)
    }

    return (
        <>
            {contextHolder}
            <Title level={2}>Roles</Title>
            <TabHeader
                handleSearch={setSearch}
                handleCreate={!isArchive ? () => setIsModalOpen(true) : undefined}
                handleModalArchive={!isArchive ? () => setIsArchive(true) : undefined}
            >
                {isArchive ? <Button onClick={() => setIsArchive(false)}>Back to roles</Button> : null}
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
                    <RoleModal
                        isModalOpen={isModalOpen}
                        handleCancel={handleCloseModal}
                        fetchData={fetchData}
                        navigate={navigate}
                    />
                </>
            ) : (<Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />)}
        </>
    )
}


interface RoleInputProps {
    selectedData?: IRole
    fetchData?: (args?: IArguments) => void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

interface RoleModalProps {
    isModalOpen: boolean
    handleCancel: () => void
    fetchData(args?: IArguments): void
    navigate: NavigateFunction
}

function RoleModal({ isModalOpen, handleCancel, fetchData, navigate }: RoleModalProps) {
    const [form] = useForm<IRole>()
    const [loading, setLoading] = useState(false)

    function onFinish(values: IRole) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        POST(ADMINSETTINGS.ROLES.POST, restValues)
            .then((res) => {
                navigate(`/roles/${res?.data?.data?.id ?? res?.data?.id}/permissions`)
                form.resetFields()
                handleCancel()
            }).finally(() => {
                fetchData()
                setLoading(false)
            })
    }

    return <Modal title='Create - Role' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Role Name"
                name="name"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter position name...' />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input placeholder='Enter Description...' />
            </FormItem>
            <FormItem style={{ display: 'flex', alignItems: 'center' }}>
                <FormItem name="can_approve" valuePropName="checked" noStyle>
                    <Checkbox />
                </FormItem>
                <span style={{ marginLeft: 8 }}>Can Approve</span>
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        Create
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}


export function RoleInputs({ selectedData, fetchData, handleCancel }: RoleInputProps) {
    const [form] = useForm<IRole>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        form.setFieldsValue({ ...selectedData })
    }, [selectedData])

    function onFinish(values: IRole) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        PUT(ADMINSETTINGS.ROLES.PUT + selectedData?.id, { ...restValues, id: selectedData?.id })
            .then(() => {
                setTimeout(() => {
                    form.resetFields()
                    handleCancel()
                }, 500)
            }).finally(() => {
                fetchData?.()
                setTimeout(() => setLoading(false), 500)
            })
    }

    return <Form form={form} onFinish={onFinish} disabled={loading}>
        <FormItem
            label="Role Name"
            name="name"
            required
            rules={[{ required: true, message: 'Required' }]}
        >
            <Input placeholder='Enter position name...' />
        </FormItem>
        <FormItem
            name="description"
            label="Description"
        >
            <Input placeholder='Enter Description...' />
        </FormItem>
        <FormItem style={{ display: 'flex', alignItems: 'center' }}>
            <FormItem name="can_approve" valuePropName="checked" noStyle>
                <Checkbox />
            </FormItem>
            <span style={{ marginLeft: 8 }}>Can Approve</span>
        </FormItem>
        <FormItem style={{ textAlign: 'right' }}>
            <Space>
                <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                    Update
                </Button>
                <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                    Cancel
                </Button>
            </Space>
        </FormItem>
    </Form>
}