import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Select } from "antd"
import { Card, MainHeader } from "../../components"
import { useAxios } from "../../shared/lib/axios"
import { useEndpoints } from "../../shared/constants"
import { IArguments, IPermissions, IRole, PermissionRes, RoleRes } from "../../shared/interfaces"
import { RoleInputs } from "./Roles"

const { GET, DELETE, POST, PUT } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

export default function Permissions() {
    const [data, setData] = useState<IRole>()
    const { roleId } = useParams()
    const navigate = useNavigate()
    const [permissions, setPermissions] = useState<Map<string, IPermissions>>(new Map())
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
                const newPermissions = new Map(result?.modules.map((role) => [role.id, role]))
                setPermissions(newPermissions ?? new Map())
            }).finally(() => setLoadingPermissions(false))
    }

    return (
        <>
            <MainHeader>
                <h1 className='color-white'>Role Update - {data?.name ?? 'Unknown'}</h1>
            </MainHeader>
            <RoleInputs selectedData={data!} handleCancel={() => navigate('/roles')} />
            {renderNames(permissions).map((permission) => {
                return <PermissionCard permission={permission} key={permission.id} />
            })}
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