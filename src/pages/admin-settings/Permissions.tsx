import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom"
import { Table, Switch, Skeleton, Col, Button } from "antd";
import { useAxios } from "../../shared/lib/axios"
import { useEndpoints } from "../../shared/constants"
import { IRole, IRolePermission, IPermissionStatus, IPermissionToggle } from "../../shared/interfaces"
import { StyledRow } from "../EmployeeEdit"
import { RoleInputs } from "./Roles"

export default function Permissions() {
	const { roleId } = useParams()
	const navigate = useNavigate()
	const [{ ADMINSETTINGS }] = useEndpoints()
	const { GET, PUT } = useAxios()
	const [data, setData] = useState<IRole>()
	const [loading, setLoading] = useState(true)

	if (!roleId) return <Navigate to='/roles' />

	useEffect(() => {
		if (roleId !== undefined) {
			fetchPermissionByRoleId(roleId)
		}
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
		},
		{
			title: "Submodule",
			dataIndex: "submodule",
			key: "submodule",
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
		},
		{
			title: "Add",
			dataIndex: "add",
			key: "add",
			render: (add: IPermissionStatus) => {
				if (add) return (
					<ToggleSwitch
						name="Add"
						enabled={add.enabled}
						onToggle={() => handleToggleChange(add.id)}
					/>
				)
				return '-'
			}
		},
		{
			title: "Edit",
			dataIndex: "edit",
			key: "edit",
			render: (edit: IPermissionStatus) => edit ? (
				<ToggleSwitch
					name="Edit"
					enabled={edit.enabled}
					onToggle={() => handleToggleChange(edit.id)}
				/>
			) : '-'
		},
		{
			title: "Delete",
			dataIndex: "delete",
			key: "delete",
			render: (del: IPermissionStatus) => del ? <ToggleSwitch
				name="Add"
				enabled={del.enabled}
				onToggle={() => handleToggleChange(del.id)}
			/> : '-'
		},
		{
			title: "View",
			dataIndex: "view",
			key: "view",
			render: (view: IPermissionStatus) => view ? (
				<ToggleSwitch
					name="Add"
					enabled={view.enabled}
					onToggle={() => handleToggleChange(view.id)}
				/>
			) : '-'
		},
		{
			title: "Additional Toggles",
			dataIndex: "additional_toggles",
			key: "additional_toggles",
			render: (record: IPermissionToggle[] | []) => {
				if (Array.isArray(record) && record.length === 0) return null
				return record.map((toggle) => (
					<div className="additional-toggles-container" key={toggle.id}>
						<div className="toggle-item">
							<span className="toggle-name">{toggle.name}:</span>
							<ToggleSwitch
								enabled={toggle.enabled}
								name={toggle.name}
								onToggle={() => handleToggleChange(toggle.id)}
							/>
						</div>
					</div>
				))
			},
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
			<Table dataSource={data?.permissions ?? []} columns={columns} loading={loading} rowKey={(data: any) => data?.id} />
		</>
	)
}

interface IToggleSwitchProps {
	enabled: boolean;
	name: string;
	onToggle: () => Promise<void>
}

const ToggleSwitch: React.FC<IToggleSwitchProps> = ({ enabled, name, onToggle }) => <Switch checked={enabled} onChange={onToggle} />