import { useState, useEffect, useMemo } from 'react'
import { Form as AntDForm, Row, Col, DatePicker, Button, Select, Modal, Space, Checkbox } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { Action, Card, Divider, TabHeader, Table } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, ITeamProjects, IClient, IClientBranch, ISchedules, EmployeeClientsRes, ITeam } from '../../shared/interfaces'
import dayjs from 'dayjs';
import { useTeamCtx } from '../MyTeamEdit'
import { AiOutlineEdit } from 'react-icons/ai'
import { TeamModal } from '../system-settings/hr-settings/Team'
import { CheckboxChangeEvent } from 'antd/es/checkbox'

const { useForm, Item } = AntDForm

const [{ SYSTEMSETTINGS: { HRSETTINGS, CLIENTSETTINGS }, EMPLOYEE201: { USERPROFILE }, TASKS }] = useEndpoints()
const { GET, PUT, POST, DELETE } = useAxios()

export default function ProjectTeams() {
    const { teamId, teamInfo, fetchData } = useTeamCtx()
    const [selectedData, setSelectedData] = useState<ITeamProjects | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [data, setData] = useState<ITeam | undefined>()
    const [loading, setLoading] = useState(false)

    const memoizedTeams = useMemo(() => {
        const newTeam = new Map(teamInfo?.teams?.map((team) => [team.id, team]))
        return newTeam
    }, [teamInfo])

    console.log(memoizedTeams)

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchTeams({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    console.log(memoizedTeams)

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
            width: 130
        },
        {
            title: 'Assign Project',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: ITeamProjects) => <Checkbox value={record.id} checked={memoizedTeams?.has(record.id)} onChange={onChangeCheckBox} />,
            width: 200
        },
    ]

    function onChangeCheckBox(evt: CheckboxChangeEvent) {
        updateTeam(evt.target.value)
    }

    function fetchTeams(args?: IArguments) {
        setLoading(true)
        axiosClient.get<any>(HRSETTINGS.TEAMS.LISTS)
            .then(({ data }) => setData(data ?? [])).finally(() => setLoading(false))
    }

    function updateTeam(id: string) {
        setLoading(true)
        PUT(USERPROFILE.PUT + teamId, {
            first_name: teamInfo.first_name,
            last_name: teamInfo.last_name,
            email: teamInfo.email,
            department_id: teamInfo?.department_id,
            employee_code: teamInfo?.employee_code,
            role_id: teamInfo?.role_id,
            team_id: [...Array.from(memoizedTeams.keys()), id]
        })
            .finally(() => {
                fetchData()
                setLoading(false)
            })
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
            <Row justify='end'>
                <Button type='primary' onClick={() => setIsModalOpen(true)}>Create Project</Button>
            </Row>
            <Divider />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
            />
            <ProjectTeamsModal
                title={selectedData ? 'Update' : 'Submit'}
                isModalOpen={isModalOpen}
                selectedData={selectedData}
                fetchData={fetchData}
                handleClose={handleCloseModal}
            />
            <TeamModal
                title='Create'
                // selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
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