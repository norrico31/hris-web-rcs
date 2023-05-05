import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Row, Switch, Collapse, Skeleton, Col, Button, FloatButton } from "antd"
import useWindowSize from "../../shared/hooks/useWindowSize"
import { useAxios } from "../../shared/lib/axios"
import { useEndpoints } from "../../shared/constants"
import { IPermissions, IRole } from "../../shared/interfaces"
import { RoleInputs } from "./Roles"
import { firstLetterCapitalize } from "../../shared/utils/utilities"
import { StyledRow } from "../EmployeeEdit"

const { GET, PUT } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

export default function Permissions() {
    const [data, setData] = useState<IRole>()
    const { roleId } = useParams()
    const navigate = useNavigate()
    const { width } = useWindowSize()
    const [modules, setModules] = useState<Record<string, IPermissions[]>>()
    const [loading, setLoading] = useState(true)
    const [loadingPermission, setLoadingPermission] = useState(false)
    // const firstData: IPermissions = permissions.values().next().value // to get the first element in Map
    useEffect(function () {
        if (roleId != undefined) fetchPermissions(roleId)
        GET('/modules')
            .then((res) => {
                console.log(res)
            })
    }, [])

    const fetchPermissions = (roleId: string) => {
        GET<unknown>(ADMINSETTINGS.PERMISSIONS.SHOW + roleId)
            .then((data) => {
                const result = data as IRole
                setData(result)
                const modules = result?.modules.sort((a, b) => a.module > b.module ? 1 : -1)
                const newModules = {} as { [k: string]: IPermissions[] }
                for (let i = 0; i < modules?.length; i++) {
                    if (!newModules[modules[i].name]) newModules[modules[i].name] = []
                    newModules[modules[i].name].push(modules[i])
                }
                setModules(newModules)
            }).finally(() => setLoading(false))
    }

    function updatePermission(permissionId: string) {
        setLoadingPermission(true)
        PUT(ADMINSETTINGS.PERMISSIONS.PUT + permissionId, { role_id: roleId, id: permissionId })
            .then((res) => {
                console.log(res)
            })
            .finally(() => {
                setLoadingPermission(false)
                fetchPermissions(roleId!)
            })
    }
    const flattenMapped = new Map(Array.from(Object.values(modules ?? {})).flat().map((flat => [flat.id, flat])))
    return (
        <> {loading ? <Skeleton /> : (
            <>
                <StyledRow justify='space-between' isCenter={width < 579}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                        <h2 className='color-white'>Role Update - {data?.name ?? 'Unknown'}</h2>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={11} style={{ textAlign: width < 579 ? 'center' : 'right' }}>
                        <Button onClick={() => navigate('/roles')}>Back to Roles</Button>
                    </Col>
                </StyledRow>
                <RoleInputs selectedData={data!} handleCancel={() => navigate('/roles')} />
                <Collapse defaultActiveKey={['1']}>
                    <Collapse.Panel header='Update Permission' key='1'>
                        <Row gutter={[24, 24]}>
                            {Object.entries(modules ?? {}).map(([k, v]) => (
                                <Col key={k + v} xs={24} sm={12} md={12} lg={12} xl={12}>
                                    <Collapse >
                                        <Collapse.Panel header={firstLetterCapitalize(k.split('_').join(' '))} key={k + v}>
                                            {actionSorter(v).map((val) => (
                                                <Row key={val.id} justify='space-between' style={{ marginBottom: 5 }}>
                                                    <p>{firstLetterCapitalize(val.action)}</p>
                                                    <Switch checked={flattenMapped.has(val.id)} disabled={loadingPermission} onChange={() => updatePermission(val.id)} />
                                                </Row>
                                            ))}
                                        </Collapse.Panel>
                                    </Collapse>
                                </Col>
                            ))}
                            <FloatButton.BackTop />
                        </Row>
                    </Collapse.Panel>
                </Collapse>
            </>
        )}</>
    )
}
const actionSorter = (v: IPermissions[]) => v.sort((a, b) => a.action > b.action ? 1 : -1)