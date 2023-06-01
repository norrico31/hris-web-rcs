import { useState, useEffect } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { Space, Button, Input, Form as AntDForm, Popconfirm, Row, Modal } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { BiRefresh } from 'react-icons/bi'
import { Table, Card, TabHeader, Form } from "../../components"
import { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'
import { IArguments, IRole, RoleRes, TableParams } from '../../shared/interfaces'
import { BsFillTrashFill, BsEye } from 'react-icons/bs'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

export default function Roles() {
    const [data, setData] = useState<IRole[]>([])
    const navigate = useNavigate()
    const [selectedData, setSelectedData] = useState<IRole | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isArchive, setIsArchive] = useState(false)

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
            render: (_: any, record: IRole) => !isArchive ? <Space>
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
            .finally(fetchData)
    }

    function handleCloseModal() {
        setIsModalOpen(false)
    }

    return (
        <Card title={`Roles ${isArchive ? '- Archives' : ''}`}>
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
                        title={selectedData != undefined ? 'Update' : 'Create'}
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
        </Card>
    )
}


interface RoleInputProps {
    selectedData?: IRole
    fetchData?: (args?: IArguments) => void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

interface RoleModalProps {
    title: string
    isModalOpen: boolean
    handleCancel: () => void
    fetchData(args?: IArguments): void
    navigate: NavigateFunction
}

function RoleModal({ title, isModalOpen, handleCancel, fetchData, navigate }: RoleModalProps) {
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

    return <Modal title={`${title} - Role`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
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