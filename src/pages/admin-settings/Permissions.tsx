import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom"
import { Table, Switch, Skeleton, Col, Button, FloatButton } from "antd";
import { useAxios } from "../../shared/lib/axios"
import { useEndpoints } from "../../shared/constants"
import { IRole, IRolePermission, IPermissionStatus, IPermissionToggle } from "../../shared/interfaces"
import { StyledRow } from "../EmployeeEdit"
import { RoleInputs } from "./Roles"
import { firstLetterCapitalize } from "../../shared/utils/utilities";

export default function Permissions() {
	const { roleId } = useParams()
	const navigate = useNavigate()
	const [{ ADMINSETTINGS }] = useEndpoints()
	const { GET, PUT } = useAxios()
	const [data, setData] = useState<IRole>()
	const [loading, setLoading] = useState(true)

	if (!roleId) return <Navigate to='/roles' />

	useEffect(() => {
		if (roleId !== undefined) fetchPermissionByRoleId(roleId)
	}, [roleId])

	const fetchPermissionByRoleId = (roleId: string) => {
		GET<IRole>(`${ADMINSETTINGS.PERMISSIONS.SHOW}${roleId}`)
			.then(setData)
			.finally(() => setLoading(false))
	}

	const handleToggleChange = async (permissionId: string) => {
		console.log(permissionId)
		try {
			await PUT(ADMINSETTINGS.PERMISSIONS.PUT + roleId, {
				id: permissionId,
				role_id: roleId
			})
		} catch (error) {
			console.error('Error updating permission:', error)
		} finally {
			fetchPermissionByRoleId(roleId!)
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
			render: (add: IPermissionStatus) => {
				if (add?.enabled) return (
					<ToggleSwitch
						name="Add"
						enabled={add.enabled}
						onToggle={() => handleToggleChange(add.id)}
					/>
				)
				return '-'
			},
			width: 150
		},
		{
			title: "Edit",
			dataIndex: "edit",
			key: "edit",
			render: (edit: IPermissionStatus) => edit?.enabled ? (
				<ToggleSwitch
					name="Edit"
					enabled={edit.enabled}
					onToggle={() => handleToggleChange(edit.id)}
				/>
			) : '-',
			width: 150
		},
		{
			title: "Delete",
			dataIndex: "delete",
			key: "delete",
			render: (del: IPermissionStatus) => del?.enabled ? <ToggleSwitch
				name="Add"
				enabled={del.enabled}
				onToggle={() => handleToggleChange(del.id)}
			/> : '-',
			width: 150
		},
		{
			title: "View",
			dataIndex: "view",
			key: "view",
			render: (view: IPermissionStatus) => view?.enabled ? (
				<ToggleSwitch
					name="Add"
					enabled={view.enabled}
					onToggle={() => handleToggleChange(view.id)}
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
						enabled={toggle.enabled}
						name={toggle.name}
						onToggle={() => handleToggleChange(toggle.id)}
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
	enabled: boolean;
	name: string;
	onToggle: () => Promise<void>
}

const ToggleSwitch: React.FC<IToggleSwitchProps> = ({ enabled, name, onToggle }) => <Switch checked={enabled} onChange={onToggle} />