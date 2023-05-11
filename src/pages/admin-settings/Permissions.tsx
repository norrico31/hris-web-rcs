<<<<<<< HEAD
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Row, Switch, Collapse, Skeleton, Col, Button, FloatButton, Table, Space } from "antd"
import useWindowSize from "../../shared/hooks/useWindowSize"
import { useAxios } from "../../shared/lib/axios"
import { useEndpoints } from "../../shared/constants"
import { IPermissions, IRole } from "../../shared/interfaces"
import { RoleInputs } from "./Roles"
import { firstLetterCapitalize } from "../../shared/utils/utilities"
import { StyledRow } from "../EmployeeEdit"
import { ColumnsType } from "antd/es/table"

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
    const columns: ColumnsType<any> = [
        {
            title: 'Module',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Permissions',
            key: 'permissions',
            dataIndex: 'permissions',
            render: (_, record) => record?.permissions.length > 0 ? record?.permissions.map((permission: any) => {
                return <Col key={permission?.id}>{permission.name}</Col>
            }) : '-'
        },
        {
            title: 'Sub Module',
            key: 'subgroups',
            dataIndex: 'subgroups',
            render: (_, record) => {
                // record?.subgroups?.map((subgroup: any) => console.log('aha: ', subgroup?.subgroups))
                return record?.subgroups?.map((outerSubgroup: any) => {
                    if (outerSubgroup?.subgroups) return outerSubgroup?.subgroups?.map((innerSubgroup: any) => {
                        if (innerSubgroup?.permissions) return innerSubgroup?.permissions?.map((innerPermission: any) => <Col key={innerPermission?.name}>{innerPermission?.name}</Col>)
                        return <Col key={innerSubgroup?.name}>{innerSubgroup?.name}</Col>
                    })
                    return outerSubgroup?.permissions?.map((permission: any) => {
                        return <Col key={permission?.id}>{permission.name}</Col>
                    })
                }) ?? '-'
            }
        }
        // {
        //     title: 'Action',
        //     key: 'action',
        //     dataIndex: 'action',
        //     align: 'center',
        //     render: (_: any, record: IRole) => <Space>
        //         <Button
        //             id='edit'
        //             type='default'
        //             size='middle'
        //             onClick={() => navigate('/roles/' + record.id + '/permissions')}
        //             className='btn-edit'
        //         >
        //             <Row align='middle' style={{ gap: 5 }}>
        //                 <p style={{ color: '#fff' }}>View</p>
        //                 <BsEye color='white' />
        //             </Row>
        //         </Button>
        //         <Popconfirm
        //             title={`Delete the ${record?.name}`}
        //             description={`Are you sure you want to delete ${name}?`}
        //             onConfirm={() => handleDelete(record?.id)}
        //             okText="Delete"
        //             cancelText="Cancel"
        //         >
        //             <Button id='delete' type='primary' size='middle'>
        //                 <BsFillTrashFill />
        //             </Button>
        //         </Popconfirm>
        //     </Space>
        // },
    ]

    const flattenMapped = new Map(data?.permissions?.map((flat => [flat.id, flat])))
    return loading ? <Skeleton /> : (
        <>
            <StyledRow justify='space-between'>
                <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                    <h2 className='color-white'>Role Update - {data?.name ?? 'Unknown'}</h2>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={11} style={{ textAlign: width < 579 ? 'center' : 'right' }}>
                    <Button onClick={() => navigate('/roles')}>Back to Roles</Button>
                </Col>
            </StyledRow>
            <RoleInputs selectedData={data!} handleCancel={() => navigate('/roles')} />
            <Table dataSource={modules} columns={columns} rowKey={(data: any) => data?.name} />
            {/* <Tree loadingPermission={loadingPermission} permissions={modules!} flattenMapped={flattenMapped} updatePermission={updatePermission} /> */}
        </>
    )
=======
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Switch } from "antd";
import { useAxios } from "../../shared/lib/axios";
import { useEndpoints } from "../../shared/constants";
import { IRole, IRolePermission, IPermissionStatus, IPermissionToggle } from "../../shared/interfaces";
import "../../styles/permissions.css";

export default function Permissions() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [{ ADMINSETTINGS }] = useEndpoints();
  const { GET, PUT } = useAxios();
  const [data, setData] = useState<IRolePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleId !== undefined) {
      fetchPermissionByRoleId(roleId);
    }
  }, [roleId]);

  const fetchPermissionByRoleId = (roleId: string) => {
    GET<IRole>(`${ADMINSETTINGS.PERMISSIONS.SHOW}${roleId}`)
      .then((res) => {
        const role = res;
        if (role) {
          setData(role.permissions);
        }
      })
      .finally(() => setLoading(false));
  };
  
  const handleToggleChange = async (permissionId: string, roleId: string) => {
    try {
      await PUT(`/api/permissions/${permissionId}`, {
        id: roleId,
        // Other updated permission data if needed
      });
      await fetchPermissionByRoleId(roleId);
      console.log('Permission updated successfully');
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };
  
//   const fetchPermissionByRoleId = (roleId: string) => {
//     GET<RoleRes>(`${ADMINSETTINGS.PERMISSIONS.SHOW}${roleId}`)
//       .then((res) => {
//         const role = res?.data;
//         if (role) {
//           setData(role.permissions); // Accessing the permissions property from role
//         }
//       })
//       .finally(() => setLoading(false));
//   };

interface IToggleSwitchProps {
  enabled: boolean;
  name: string;
  onToggle: () => Promise<void>;
>>>>>>> afb834a4839c3b622da8d280faebdc0f4835f29c
}

const ToggleSwitch: React.FC<IToggleSwitchProps> = ({ enabled, name, onToggle }) => {
  return <Switch checked={enabled} onChange={onToggle} />;
};

<<<<<<< HEAD
function Tree({ loadingPermission, permissions, flattenMapped, updatePermission, }: TreeProps) {
    return <Row justify='space-around' gutter={[6, 24]} wrap>
        {permissions.map((permission) => <TreeNode loadingPermission={loadingPermission} permission={permission} key={permission.name} flattenMapped={flattenMapped} updatePermission={updatePermission} />)}
        <FloatButton.BackTop />
    </Row>
}
=======
  
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
        return (
          <ToggleSwitch
            name="Add"
            enabled={add.enabled}
            onToggle={() => handleToggleChange(add.id, roleId as any)}
          />
        );
      },
    },
    {
        title: "Edit",
        dataIndex: "edit",
        key: "edit",
        render: (edit: IPermissionStatus) => {
          return (
            <ToggleSwitch
              name="Edit"
              enabled={edit.enabled}
              onToggle={() => handleToggleChange(edit.id, roleId as any)}
            />
          );
        },
      },
      {
        title: "Delete",
        dataIndex: "delete",
        key: "delete",
        render: (del: IPermissionStatus) => {
          return (
            <ToggleSwitch
              name="Add"
              enabled={del.enabled}
              onToggle={() => handleToggleChange(del.id, roleId as any)}
            />
          );
        },
      },
      {
        title: "View",
        dataIndex: "view",
        key: "view",
        render: (view: IPermissionStatus) => {
          return (
            <ToggleSwitch
              name="Add"
              enabled={view.enabled}
              onToggle={() => handleToggleChange(view.id, roleId as any)}
            />
          );
        },
      },
      // Inside the columns definition
      {
        title: "Additional Toggles",
        dataIndex: "additional_toggles",
        key: "additional_toggles",
        render: (toggles: IPermissionToggle[] | []) => {
          if (Array.isArray(toggles) && toggles.length === 0) {
            return null; // or any desired rendering for an empty array
          } else {
            return (
              <div className="additional-toggles-container">
                {toggles.map((toggle) => (
                  <div className="toggle-item" key={toggle.id}>
                    <span className="toggle-name">{toggle.name}:</span>
                    <ToggleSwitch
                      enabled={toggle.enabled}
                      name={toggle.name}
                      onToggle={() => handleToggleChange(toggle.id, roleId as string)}
                    />
                  </div>
                ))}
            </div>
            );
          }
        },
      }
  ];
  
>>>>>>> afb834a4839c3b622da8d280faebdc0f4835f29c

  return (
    <Table dataSource={data} columns={columns} loading={loading} rowKey="id" />
  );
}
<<<<<<< HEAD

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
=======
>>>>>>> afb834a4839c3b622da8d280faebdc0f4835f29c
