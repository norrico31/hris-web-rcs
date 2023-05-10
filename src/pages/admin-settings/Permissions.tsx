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

interface IModules {
    name: string
    permissions: IPermissions[]
    subgroups?: IModules[]
}

export default function Permissions() {
    const { roleId } = useParams()
    const navigate = useNavigate()
    const { width } = useWindowSize()
    const [data, setData] = useState<IRole>()
    const [modules, setModules] = useState<IModules[] | undefined>([])
    const [loading, setLoading] = useState(true)
    const [loadingPermission, setLoadingPermission] = useState(false)

    useEffect(function () {
        if (roleId != undefined) fetchPermissionByRoleId(roleId)
        fetchPermissions()
    }, [])

    const fetchPermissions = () => GET<IModules[]>(ADMINSETTINGS.PERMISSIONS.MODULES).then(setModules).finally(() => setLoading(false))
    const fetchPermissionByRoleId = (roleId: string) => GET<IRole>(ADMINSETTINGS.PERMISSIONS.SHOW + roleId).then(setData).finally(() => setLoading(false))
    function updatePermission(permissionId: string) {
        setLoadingPermission(true)
        PUT(ADMINSETTINGS.PERMISSIONS.PUT + permissionId, { role_id: roleId, id: permissionId })
            .finally(() => {
                setLoadingPermission(false)
                fetchPermissionByRoleId(roleId!)
            })
    }
    const flattenMapped = new Map(data?.permissions?.map((flat => [flat.id, flat])))
    return loading ? <Skeleton /> : (
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
            <Tree loadingPermission={loadingPermission} permissions={modules!} flattenMapped={flattenMapped} updatePermission={updatePermission} />
        </>
    )
}

type TreeProps = {
    loadingPermission: boolean
    permissions: IModules[];
    flattenMapped: Map<string, IPermissions>;
    updatePermission: (permissionId: string) => void
}

function Tree({ loadingPermission, permissions, flattenMapped, updatePermission, }: TreeProps) {
    return <Row justify='space-around' gutter={[6, 24]} wrap>
        {permissions.map((permission) => <TreeNode loadingPermission={loadingPermission} permission={permission} key={permission.name} flattenMapped={flattenMapped} updatePermission={updatePermission} />)}
        <FloatButton.BackTop />
    </Row>
}

type TreeNodeProps = {
    loadingPermission: boolean
    permission: IModules;
    flattenMapped: Map<string, IPermissions>;
    updatePermission: (permissionId: string) => void
}

function TreeNode({ permission, flattenMapped, updatePermission, loadingPermission }: TreeNodeProps) {
    const hasSubgroups = permission.subgroups?.length! > 0;
    return <Col key={permission.name} xs={24} sm={24} md={!hasSubgroups ? 6 : 24} lg={!hasSubgroups ? 6 : 24} xl={!hasSubgroups ? 6 : 24}>
        <Collapse defaultActiveKey={['1']}>
            <Collapse.Panel header={firstLetterCapitalize(permission.name)} key='1'>
                {permission.permissions?.sort((a, b) => a.route > b.route ? 1 : -1)?.map((permission) => <Row key={permission.id} justify='space-between' style={{ marginBottom: 5 }}>
                    <p>{firstLetterCapitalize(permission?.route.split('.')[1])}</p>
                    <Switch loading={loadingPermission} disabled={loadingPermission} checked={flattenMapped.has(permission?.id)} onChange={() => updatePermission(permission?.id)} />
                </Row>)}
                {hasSubgroups && <Tree loadingPermission={loadingPermission} permissions={permission?.subgroups!} flattenMapped={flattenMapped} updatePermission={updatePermission} />}
            </Collapse.Panel>
        </Collapse>
    </Col>
}