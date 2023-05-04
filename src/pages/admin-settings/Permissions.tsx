import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Row, Switch, Collapse, Space } from "antd"
import { Card, MainHeader } from "../../components"
import { useAxios } from "../../shared/lib/axios"
import { useEndpoints } from "../../shared/constants"
import { IArguments, IPermissions, IRole, PermissionRes, RoleRes } from "../../shared/interfaces"
import { RoleInputs } from "./Roles"
import { firstLetterCapitalize } from "../../shared/utils/utilities"

const { GET, DELETE, POST, PUT } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

export default function Permissions() {
    const [data, setData] = useState<IRole>()
    const { roleId } = useParams()
    const navigate = useNavigate()
    const [modules, setModules] = useState<Record<string, IPermissions[]>>()
    const [loadingRoles, setLoadingRoles] = useState(true)
    const [loadingPermissions, setLoadingPermissions] = useState(true)
    // const firstData: IPermissions = permissions.values().next().value

    // useEffect(() => {
    //     const newLists = new Map(items.map((itm) => [itm.id, itm]))
    //     setPermissions(newLists)
    // }, [])

    useEffect(function () {
        if (roleId != undefined) fetchPermissions(roleId)
    }, [])

    const fetchPermissions = (roleId: string) => {
        setLoadingPermissions(true)
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
            }).finally(() => setLoadingPermissions(false))
    }

    const flattenMapped = new Map(Array.from(Object.values(modules ?? {})).flat().map((flat => [flat.id, flat])))
    console.log(flattenMapped)
    console.log(flattenMapped.has("58fa6104-4abe-4b9b-ad8d-c64564b3d355"))

    return (
        <>
            <MainHeader>
                <h1 className='color-white'>Role Update - {data?.name ?? 'Unknown'}</h1>
            </MainHeader>
            <RoleInputs selectedData={data!} handleCancel={() => navigate('/roles')} />
            <Collapse>
                <Collapse.Panel header='Update Permission' key='1'>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {Object.entries(modules ?? {}).map(([k, v]) => {
                            return (
                                <Collapse key={k + v}>
                                    <Collapse.Panel header={firstLetterCapitalize(k)} key={k + v}>
                                        <div>
                                            {v.sort((a, b) => a.action > b.action ? 1 : -1).map((val) => (
                                                <Row justify='space-between' key={val.id} style={{ marginBottom: 5 }}>
                                                    <p>{firstLetterCapitalize(val.action)}</p>
                                                    <Switch checked={flattenMapped.has(val.id)} />
                                                </Row>
                                            ))}
                                        </div>
                                    </Collapse.Panel>
                                </Collapse>
                            )
                        })}
                    </Space>
                </Collapse.Panel>
            </Collapse>
        </>
        // <Card title='Permissions'>
        // {firstData.name}
        // </Card>
    )
}

function PermissionCard({ permission }: { permission: IPermissions }) {
    return <div key={permission.id}>
        {permission.module} - {permission.action}
    </div>
}

const renderNames = (permissions: Map<string, IPermissions>) => Array.from(permissions.values()).sort((a, b) => a?.action < b?.action ? 1 : -1)