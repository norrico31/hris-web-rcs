import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Select } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import axiosClient, { useAxios } from '../../../shared/lib/axios'
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useEndpoints } from '../../../shared/constants'
import { IArguments, TableParams, TasksActivitiesRes, ITaskActivities, ITeam, TeamRes } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { TASKSSETTINGS, HRSETTINGS } }] = useEndpoints()

export default function TaskActivities() {
    const [data, setData] = useState<ITaskActivities[]>([])
    const [selectedData, setSelectedData] = useState<ITaskActivities | undefined>(undefined)
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

    const columns: ColumnsType<ITaskActivities> = [
        {
            title: 'Team',
            key: 'team_name',
            dataIndex: 'team_name',
            render: (_, record) => record.team?.name
        },
        {
            title: 'Task Activity Name',
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
            render: (_: any, record: ITaskActivities) => <Action
                title='Activity'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<TasksActivitiesRes>(TASKSSETTINGS.ACTIVITIES.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(TASKSSETTINGS.ACTIVITIES.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ITaskActivities) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Task Activities'>
            <TabHeader
                name='task activities'
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
            <ActivityModal
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
    selectedData?: ITaskActivities
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

export function ActivityModal({ title, selectedData, isModalOpen, fetchData, handleCancel }: ModalProps) {
    const [form] = useForm<ITaskActivities>()
    const [teams, setTeams] = useState<ITeam[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData! })
        } else {
            form.resetFields(undefined)
        }

        const controller = new AbortController();
        axiosClient(HRSETTINGS.TEAMS.LISTS, { signal: controller.signal })
            .then((res) => setTeams(res?.data ?? []));
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: ITaskActivities) {
        setLoading(true)
        const result = selectedData != undefined ? PUT(TASKSSETTINGS.ACTIVITIES.PUT + selectedData.id!, { ...formValues(values), id: selectedData.id! }) : POST(TASKSSETTINGS.ACTIVITIES.POST, formValues(values))
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Activity`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Activity Name"
                name="name"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter activity name...' />
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

function formValues(values: ITaskActivities | any) {
    const payload: { [k: string]: string | null } = {}
    for (const k in values as { [k: string]: string | undefined }) {
        payload[k] = values[k] != undefined ? values[k] : null;
    }
    return payload
}