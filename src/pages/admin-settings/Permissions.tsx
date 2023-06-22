import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom"
import { Table, Switch, Skeleton, Col, Button, FloatButton } from "antd";
import { useAuthContext } from "../../shared/contexts/Auth";
import { useAxios } from "../../shared/lib/axios"
import { ADMINSETTINGSPATHS, useEndpoints } from "../../shared/constants"
import { IRole, IPermissionStatus, IPermissionToggle } from "../../shared/interfaces"
import { StyledRow } from "../EmployeeEdit"
import { RoleInputs } from "./Roles"
import { firstLetterCapitalize } from "../../shared/utils/utilities";
import { filterCodes, filterPaths } from "../../components/layouts/Sidebar";

export default function Permissions() {
	const { user, loading: loadingUser } = useAuthContext()
	const { roleId } = useParams()
	const navigate = useNavigate()
	const [{ ADMINSETTINGS }] = useEndpoints()
	const { GET, PUT } = useAxios()
	const [data, setData] = useState<IRole>()
	const [loading, setLoading] = useState(true)
	const [loadingPermission, setLoadingPermission] = useState(false)

	if (!roleId) return <Navigate to='/roles' />

	const codes = filterCodes(user?.role?.permissions)
	const paths = useMemo(() => filterPaths(user?.role?.permissions!, ADMINSETTINGSPATHS), [user])
	if (loadingUser) return <Skeleton />
	if (!loadingUser && !codes['ib01']) return <Navigate to={'/' + paths[0]} />

	useEffect(() => {
		if (roleId !== undefined) fetchPermissionByRoleId(roleId)
	}, [roleId])

	const fetchPermissionByRoleId = (roleId: string) => {
		GET<IRole>(`${ADMINSETTINGS.PERMISSIONS.SHOW}${roleId}`)
			.then(setData)
			.finally(() => setLoading(false))
	}

	const toggleChange = async (permissionId: string) => {
		setLoadingPermission(true)
		try {
			await PUT(ADMINSETTINGS.PERMISSIONS.PUT + roleId, {
				id: permissionId,
				role_id: roleId
			})
		} catch (error) {
			console.error('Error updating permission:', error)
		} finally {
			fetchPermissionByRoleId(roleId!)
			setLoadingPermission(false)
		}
	}

	const columns = [
		{
			title: "Module",
			dataIndex: "module",
			key: "module",
			width: 150,
		},
		{
			title: "Submodule",
			dataIndex: "submodule",
			key: "submodule",
			width: 150,
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			width: 150,
		},
		{
			title: "Add",
			dataIndex: "add",
			key: "add",
			render: (add: IPermissionStatus) => add?.enabled != undefined ? (
				<ToggleSwitch
					loading={loadingPermission}
					enabled={add.enabled}
					onToggle={() => toggleChange(add.id)}
				/>
			) : '-',
			width: 150
		},
		{
			title: "Edit",
			dataIndex: "edit",
			key: "edit",
			render: (edit: IPermissionStatus) => edit?.enabled != undefined ? (
				<ToggleSwitch
					loading={loadingPermission}
					enabled={edit.enabled}
					onToggle={() => toggleChange(edit.id)}
				/>
			) : '-',
			width: 150
		},
		{
			title: "Delete",
			dataIndex: "delete",
			key: "delete",
			render: (del: IPermissionStatus) => del?.enabled != undefined ? <ToggleSwitch
				loading={loadingPermission}
				enabled={del.enabled}
				onToggle={() => toggleChange(del.id)}
			/> : '-',
			width: 150
		},
		{
			title: "View",
			dataIndex: "view",
			key: "view",
			render: (view: IPermissionStatus) => view?.enabled != undefined ? (
				<ToggleSwitch
					loading={loadingPermission}
					enabled={view.enabled}
					onToggle={() => toggleChange(view.id)}
				/>
			) : '-',
			width: 150
		},
		{
			title: "Additional Toggles",
			dataIndex: "additional_toggles",
			key: "additional_toggles",
			render: (record: IPermissionToggle[] | []) => !record.length ? null : record.map((toggle) => <div className="additional-toggles-container" key={toggle.id}>
				<div className="toggle-item">
					<span className="toggle-name">{firstLetterCapitalize(toggle.name.split('_').join(' '))}:</span>
					<ToggleSwitch
						loading={loadingPermission}
						enabled={toggle.enabled}
						onToggle={() => toggleChange(toggle.id)}
					/>
				</div>
			</div>),
			width: 150
		}
	]

	return loading ? <Skeleton /> : (
		<>
			<StyledRow justify='space-between'>
				<Col xs={24} sm={12} md={12} lg={12} xl={11}>
					<h2 className='color-white'>Role Update - {data?.name ?? 'Unknown'}</h2>
				</Col>
				<Col xs={24} sm={12} md={12} lg={12} xl={11} style={{ textAlign: 'right' }}>
					<Button onClick={() => navigate('/roles')}>Back to Roles</Button>
				</Col>
			</StyledRow>
			<RoleInputs selectedData={data!} handleCancel={() => navigate('/roles')} />
			<Table dataSource={data?.permissions ?? []} columns={columns} loading={loading} rowKey={(data: any) => data?.id} pagination={{ pageSize: 1000 }} />
			<FloatButton.BackTop />
		</>
	)
}

interface IToggleSwitchProps {
	loading: boolean
	enabled: boolean;
	onToggle: () => Promise<void>
}

const ToggleSwitch: React.FC<IToggleSwitchProps> = ({ loading, enabled, onToggle }) => <Switch disabled={loading} loading={loading} checked={enabled} onChange={onToggle} />