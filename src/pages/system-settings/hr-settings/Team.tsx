import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Select } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import axiosClient, { useAxios } from '../../../shared/lib/axios'
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useEndpoints } from '../../../shared/constants'
import { IArguments, TableParams, ITeam, TeamRes, IDepartment } from '../../../shared/interfaces'
import { Alert } from '../../../shared/lib/alert'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS: { TEAMS, DEPARTMENT } } }] = useEndpoints()

export default function Team() {
    const [data, setData] = useState<ITeam[]>([])
    const [selectedData, setSelectedData] = useState<ITeam | undefined>(undefined)
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

    const columns: ColumnsType<ITeam> = [
        {
            title: 'Team',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Department',
            key: 'department',
            dataIndex: 'department',
            render: (_, record) => record.department?.name
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
            render: (_: any, record: ITeam) => <Action
                title='Activity'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<TeamRes>(TEAMS.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const handleChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function handleDelete(id: string) {
        DELETE(TEAMS.DELETE, id)
            .catch(err => Alert.warning('Delete Unsuccessful', err?.response?.data?.message))
            .finally(fetchData)
    }

    function handleEdit(data: ITeam) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Teams'>
            <TabHeader
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={handleChange}
            />
            <TeamModal
                title={selectedData != undefined ? 'Update' : 'Create'}
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
    selectedData?: ITeam
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

function TeamModal({ title, selectedData, isModalOpen, fetchData, handleCancel }: ModalProps) {
    const [form] = useForm<ITeam>()
    const [departments, setDepartments] = useState<IDepartment[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
        const controller = new AbortController();
        axiosClient(DEPARTMENT.LISTS, { signal: controller.signal })
            .then((res) => setDepartments(res?.data ?? []));
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: ITeam) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(TEAMS.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(TEAMS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Team`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Team Name"
                name="name"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter team name...' />
            </FormItem>
            <FormItem
                label="Departments"
                name="department_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select placeholder='Select team...' optionFilterProp="children" allowClear showSearch>
                    {departments.map((dep) => (
                        <Select.Option value={dep.id} key={dep.id} style={{ color: '#777777' }}>{dep.name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <FormItem name="description" label="Description">
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