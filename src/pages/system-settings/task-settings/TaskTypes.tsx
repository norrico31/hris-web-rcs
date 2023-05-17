import { useState, useEffect, useRef } from 'react'
import { Space, Button, Input, Form as AntDForm, Select } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import axiosClient, { useAxios } from '../../../shared/lib/axios'
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useEndpoints } from '../../../shared/constants'
import { IArguments, TableParams, ITaskTypes, TaskTypesRes, ITeam, TeamRes } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { TASKSSETTINGS, HRSETTINGS } }] = useEndpoints()

export default function TaskTypes() {
    const [data, setData] = useState<ITaskTypes[]>([])
    const [selectedData, setSelectedData] = useState<ITaskTypes | undefined>(undefined)
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

    const columns: ColumnsType<ITaskTypes> = [
        {
            title: 'Team',
            key: 'team_name',
            dataIndex: 'team_name',
            render: (_, record) => record.team?.name
        },
        {
            title: 'Task Type',
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
            render: (_: any, record: ITaskTypes) => <Action
                title='Types'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<TaskTypesRes>(TASKSSETTINGS.TYPES.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(TASKSSETTINGS.TYPES.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ITaskTypes) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Task Types'>
            <TabHeader
                name='task types'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                columns={columns}
                dataList={data}
                loading={loading}
                tableParams={tableParams}
                onChange={onChange}
            />
            <TypesModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                fetchData={fetchData}
                handleCancel={handleCloseModal}
            />
        </Card>
    )
}

type ModalProps = {
    title: string
    teamId?: string
    isModalOpen: boolean
    selectedData?: ITaskTypes
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

export function TypesModal({ title, teamId, selectedData, isModalOpen, fetchData, handleCancel }: ModalProps) {
    const [form] = useForm<ITaskTypes>()
    const [teams, setTeams] = useState<ITeam[]>([])
    const [loading, setLoading] = useState(false)
    console.log('types modal: ', teamId)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }

        const controller = new AbortController();
        const URL = teamId ? (HRSETTINGS.TEAMS.USERS_LISTS + '?team_id=' + teamId) : HRSETTINGS.TEAMS.LISTS;
        axiosClient(URL, { signal: controller.signal })
            .then((res) => setTeams(res?.data ?? []));
        return () => {
            controller.abort()
        }
    }, [selectedData, teamId])


    function onFinish(values: ITaskTypes) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(TASKSSETTINGS.TYPES.PUT + selectedData.id!, { ...restValues, id: selectedData.id, team_id: teamId ? teamId : null }) : POST(TASKSSETTINGS.TYPES.POST, { ...restValues, team_id: teamId ? teamId : null })
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Types`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Type Name"
                name="name"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter type name...' />
            </FormItem>
            <FormItem
                label="Team"
                name="team_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select placeholder='Select team...' optionFilterProp="children" allowClear showSearch>
                    {teams.map((team) => (
                        <Select.Option value={team.id} key={team.id} style={{ color: '#777777' }}>{team.name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <FormItem name="description" label="Description">
                <Input.TextArea placeholder='Enter description...' />
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