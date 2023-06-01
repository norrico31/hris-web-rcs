import { useState, useEffect, useMemo } from 'react'
import { Form as AntDForm, Row, Col, DatePicker, Button, Select, Modal, Space } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { Action, Card, TabHeader, Table } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, ITeamProjects, IClient, IClientBranch, ISchedules, EmployeeClientsRes, ITeam } from '../../shared/interfaces'
import dayjs from 'dayjs';
import useWindowSize from '../../shared/hooks/useWindowSize'
import { useTeamCtx } from '../MyTeamEdit'

const { useForm, Item } = AntDForm

const [{ SYSTEMSETTINGS: { HRSETTINGS, CLIENTSETTINGS }, EMPLOYEE201, TASKS }] = useEndpoints()
const { GET, PUT, POST, DELETE } = useAxios()

export default function ProjectTeams() {
    const { teamInfo } = useTeamCtx()
    const [selectedData, setSelectedData] = useState<ITeamProjects | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [data, setData] = useState<ITeamProjects | undefined>()
    const [loading, setLoading] = useState(false)

    useEffect(function fetch() {
        const controller = new AbortController();
        teamInfo && fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [teamInfo])

    const dataList = useMemo(() => data, [data])
    // const dataList = useMemo(() => data?.teams?.map((d: any) => d?.teams?.map((itm: any) => itm)).flat(), [data])

    const columns: ColumnsType<ITeamProjects> = [
        // {
        //     title: 'Department',
        //     key: 'department.name',
        //     dataIndex: 'department.name',
        //     render: (_, record) => record?.department?.name,
        //     width: 130
        // },
        {
            title: 'Project / Team',
            key: 'name',
            dataIndex: 'name',
            render: (_, record) => record?.teams[0]?.name,
            width: 130
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: ITeamProjects) => <Action
                title='Tasks'
                name={record?.teams[0]?.name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<any>(TASKS.TEAMTASKSPROJECTS + teamInfo?.id, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((data) => setData(data ?? [])).finally(() => setLoading(false))
    }

    function handleDelete(id: string) {
        DELETE(EMPLOYEE201.CLIENTSCHEDULE.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ITeamProjects) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title={`Project / Teams - ${teamInfo?.full_name}`}>
            <Table
                loading={loading}
                columns={columns}
                dataList={dataList}
            />
            <ProjectTeamsModal
                title={selectedData ? 'Update' : 'Submit'}
                isModalOpen={isModalOpen}
                selectedData={selectedData}
                fetchData={fetchData}
                handleClose={handleCloseModal}
            />
        </Card>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ITeamProjects
    fetchData: (args?: IArguments) => void
    handleClose: () => void
}

function ProjectTeamsModal({ title, isModalOpen, selectedData, handleClose, fetchData }: ModalProps) {
    const [form] = useForm()
    const [loading, setLoading] = useState(false)
    const [teams, setTeams] = useState<Array<ITeam>>([])

    useEffect(function fetchUserInfo() {
        if (selectedData) {
            form.setFieldsValue({
                ...selectedData,
                team_id: selectedData?.teams[0]?.id
            })
        } else form.resetFields()

        const controller = new AbortController();
        (async () => {
            try {
                const res = await axiosClient(HRSETTINGS.TEAMS.LISTS, { signal: controller.signal })
                setTeams(res?.data ?? [])
            } catch (error) {
                console.error('error fetching clients: ', error)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: Record<string, string>) {
        setLoading(true)
        PUT(TASKS.TEAMTASKSPROJECTS + selectedData?.id, { team_id: values?.team_id })
            .then(() => {
                form.resetFields()
                handleClose()
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                fetchData()
                setLoading(false)
            })
    }

    return (
        <Modal title={`Client and Schedule - ${title}`} open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
            <Form form={form} onFinish={onFinish} disabled={loading}>
                <Col xs={24} sm={24} md={22} lg={10} xl={10} >
                    <Item label="Project / Team" name="team_id" required rules={[{ required: true, message: 'Required' }]}>
                        <Select placeholder='Select team' allowClear showSearch optionFilterProp="children">
                            {teams.map((team) => (
                                <Select.Option value={team.id} key={team.id}>{team.name}</Select.Option>
                            ))}
                        </Select>
                    </Item>
                </Col>
                <Item style={{ textAlign: 'right' }}>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                            {selectedData != undefined ? 'Update' : 'Create'}
                        </Button>
                        <Button type="primary" onClick={handleClose} loading={loading} disabled={loading}>
                            Cancel
                        </Button>
                    </Space>
                </Item>
            </Form>
        </Modal>
    )
}