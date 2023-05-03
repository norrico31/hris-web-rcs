import { useEffect, useState } from "react"



import { useAxios } from "../../shared/lib/axios"
import { useEndpoints } from "../../shared/constants"
import { IArguments, IPermissions, IRole, PermissionRes, RoleRes } from "../../shared/interfaces"
import { Card } from "../../components"
import { Select } from "antd"
const { GET, DELETE, POST, PUT } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

export default function Permissions() {
    const [roles, setRoles] = useState<IRole[]>([])
    const [roleId, setRoleId] = useState('Select a Role')
    const [permissions, setPermissions] = useState<Map<string, IPermissions>>(new Map())
    const [loadingRoles, setLoadingRoles] = useState(true)
    const [loadingPermissions, setLoadingPermissions] = useState(true)
    // const firstData: IPermissions = permissions.values().next().value

    // useEffect(() => {
    //     const newLists = new Map(items.map((itm) => [itm.id, itm]))
    //     setPermissions(newLists)
    // }, [])

    useEffect(function () {
        const controller = new AbortController();
        fetchRoles({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const fetchRoles = (args?: IArguments) => {
        setLoadingRoles(true)
        GET<RoleRes>(ADMINSETTINGS.PERMISSIONS.SHOW, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => {
                setRoles(res?.data ?? [])
            }).finally(() => setLoadingRoles(false))
    }

    const fetchPermissions = (roleId: string) => {
        setLoadingPermissions(true)
        GET<unknown>(ADMINSETTINGS.PERMISSIONS.SHOW + roleId)
            .then((data) => {
                const result = data as IRole
                const newPermissions = new Map(result?.modules.map((role) => [role.id, role]))
                setPermissions(newPermissions ?? new Map())
            }).finally(() => setLoadingPermissions(false))
    }

    return (
        <Card title='Permissions'>
            <Select
                optionFilterProp="children"
                allowClear
                showSearch
                value={roleId}
                loading={loadingRoles || loadingPermissions}
                disabled={loadingRoles}
                onChange={(id) => {
                    if (id != undefined) {
                        fetchPermissions(id)
                        setRoleId(id)
                    } else {
                        setRoleId('Select a Role')
                    }
                }}
                style={{ width: 200 }}
            >
                {roles.map((r) => (
                    <Select.Option key={r?.id} value={r?.id}>{r?.name}</Select.Option>
                ))}
            </Select>
            {renderNames(permissions).map((permission) => {
                return <PermissionCard permission={permission} key={permission.id} />
            })}
            {/* {firstData.name} */}
        </Card>
    )
}

function PermissionCard({ permission }: { permission: IPermissions }) {
    return <div key={permission.id}>
        {permission.module} - {permission.action}
    </div>
}

const renderNames = (permissions: Map<string, IPermissions>) => Array.from(permissions.values()).sort((a, b) => a?.action < b?.action ? 1 : -1)