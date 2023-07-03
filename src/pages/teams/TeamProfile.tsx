import { useState, useEffect } from 'react'
import { Col, Row, Input, Form as AntDForm, Button, Select } from 'antd'
import { Card, Form } from '../../components'
import { IArguments, IPosition, ITeam, IUser, TableParams, UserRes } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { useEndpoints } from "../../shared/constants"
import axiosClient, { useAxios } from "../../shared/lib/axios"
import { useTeamCtx } from '../MyTeamEdit'
import useMessage from 'antd/es/message/useMessage'

const { useForm, Item } = AntDForm
const { GET, DELETE, POST, PUT } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS: { POSITION, TEAMS } }, EMPLOYEE201: { USERPROFILE } }] = useEndpoints()

export default function TeamProfile() {
    const { teamId, teamInfo, fetchData } = useTeamCtx()
    const [form] = useForm<Record<string, any>>()
    const [loading, setLoading] = useState(false)
    const [lists, setLists] = useState<{ position: IPosition[]; teams: ITeam[] }>({ position: [], teams: [] })
    const [messageApi, contextHolder] = useMessage()

    useEffect(() => {
        form.setFieldsValue({
            ...teamInfo,
            position_id: teamInfo?.position?.id,
            team_id: teamInfo?.teams.map((team) => team.id)
        })
        const controller = new AbortController();

        const positionPromise = axiosClient(POSITION.LISTS, { signal: controller.signal })
        const teamPromise = axiosClient(TEAMS.LISTS, { signal: controller.signal })

        Promise.allSettled([positionPromise, teamPromise])
            .then(([positionRes, teamRes]: any) => {
                setLists({
                    position: positionRes?.status === 'fulfilled' ? positionRes?.value?.data : [],
                    teams: teamRes?.status === 'fulfilled' ? teamRes?.value?.data : []
                })
            })
        // .then((res) => setPositions(res?.data ?? []))
        // .catch((err) => err)
        return () => {
            controller.abort()
        }
    }, [teamInfo])

    const key = 'error'
    const onFinish = (val: Record<string, any>) => {
        setLoading(true)
        PUT(USERPROFILE.PUT + teamId, {
            ...val,
            department_id: teamInfo?.department_id,
            employee_code: teamInfo?.employee_code,
            role_id: teamInfo?.role_id,
        })
            .then((res) => res)
            .catch((err) => {
                messageApi.open({
                    key,
                    type: 'error',
                    content: err.response.data.message ?? err.response.data.error,
                    duration: 5
                })
                setLoading(false)
            })
            .finally(() => {
                setLoading(false)
                fetchData()
            })
    }
    return (
        <Card title={`Profile - ${teamInfo?.full_name}`}>
            {contextHolder}
            <Form form={form} onFinish={onFinish} disabled={loading}>
                <Row justify='space-between'>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="First Name"
                            name="first_name"
                        >
                            <Input placeholder='Enter first name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Last Name"
                            name="last_name"
                        >
                            <Input placeholder='Enter last name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Middle Name"
                            name="middle_name"
                        >
                            <Input placeholder='Enter middle name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Email"
                            name="email"
                        >
                            <Input type='email' placeholder='Enter email...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Department"
                            name="department_name" // to be change
                        >
                            <Input placeholder='Enter department...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Position"
                            name="position_id"
                        >
                            <Select
                                placeholder='Select position...'
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {lists.position.map((pos) => (
                                    <Select.Option value={pos.id} key={pos.id} style={{ color: '#777777' }}>{pos.name}</Select.Option>
                                ))}
                            </Select>
                        </Item>
                    </Col>
                </Row>
                <Row justify='center'>
                    <Col>
                        <Row justify='center'>
                            <Item
                                label="Team"
                                name="team_id"
                                required
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Select
                                    placeholder='Select team...'
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    mode='multiple'
                                    style={{ width: 200 }}
                                >
                                    {lists.teams.map((team) => (
                                        <Select.Option value={team.id} key={team.id} style={{ color: '#777777' }}>{team.name}</Select.Option>
                                    ))}
                                </Select>
                            </Item>
                        </Row>
                    </Col>
                </Row>
                <Row justify='end'>
                    <Button type='primary' htmlType='submit'>Update</Button>
                </Row>
            </Form>
        </Card>
    )
}
