import { useState, useEffect, useMemo } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuthContext } from "../shared/contexts/Auth"
import { Button, Col, Form as AntDForm, Input, Modal, Upload, Skeleton, Space } from "antd"
import { PlusOutlined } from '@ant-design/icons'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { AiOutlineCalendar } from 'react-icons/ai'
import useMessage from "antd/es/message/useMessage"
import { Action, MainHeader, Table, Form, TabHeader } from "../components"
import { renderTitle } from "../shared/utils/utilities"
import { useAxios } from "../shared/lib/axios"
import { ROOTPATHS, useEndpoints } from "../shared/constants"
import { AnnouncementRes, IAnnouncements, IArguments, TableParams } from "../shared/interfaces"
import { filterCodes, filterPaths } from "../components/layouts/Sidebar"

const { GET, POST, PUT, DELETE } = useAxios()
const [{ ANNOUNCEMENT }] = useEndpoints()

export default function Announcements() {
    renderTitle('Salary Adjustment')
    const { user, loading: loadingUser } = useAuthContext()
    const navigate = useNavigate()
    const [data, setData] = useState<IAnnouncements[]>([])
    const [selectedData, setSelectedData] = useState<IAnnouncements | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function getData() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['d01', 'd02', 'd03', 'd04'].every((c) => !codes[c])) {
        if (paths.length > 0) return <Navigate to={'/' + paths[0]} />
        return <Navigate to='/profile' />
    }

    const columns: ColumnsType<IAnnouncements> = [
        {
            title: 'Title',
            key: 'title',
            dataIndex: 'title',
        },
        {
            title: 'Image',
            key: 'img',
            dataIndex: 'img',
        },
        {
            title: 'Content',
            key: 'content',
            dataIndex: 'content',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: IAnnouncements) => <Action
                title='announcements'
                name={record?.title}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<AnnouncementRes>(ANNOUNCEMENT.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => {
                setData(res?.data ?? [])
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res?.total,
                        current: res?.current_page,
                        pageSize: res?.per_page,
                    },
                })
            }).finally(() => setLoading(false))
    }

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({
            search: str,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function handleDelete(id: string) {
        DELETE(ANNOUNCEMENT.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IAnnouncements) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <>
            <MainHeader>
                <Col>
                    <h1 className='color-white'>Announcements</h1>
                </Col>
                <Col>
                    <Button className="btn-timeinout" size="large" onClick={() => setIsModalOpen(true)}>
                        Create
                        <AiOutlineCalendar />
                    </Button>
                </Col>
            </MainHeader>
            <TabHeader
                handleSearch={handleSearch}
                handleModalArchive={() => navigate('/announcements/archives')}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <AnnouncementsModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                userId={user?.id!}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                fetchData={fetchData}
                handleCancel={handleCloseModal}
            />
        </>
    )
}

type ModalProps = {
    title: string
    userId: string
    isModalOpen: boolean
    selectedData?: IAnnouncements
    fetchData: (args?: IArguments) => void
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function AnnouncementsModal({ title, userId, fetchData, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<IAnnouncements>()
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = useMessage()

    useEffect(() => {
        if (selectedData != undefined) {
            console.log(selectedData)
            form.setFieldsValue({
                ...selectedData,
                img: null
            })
        } else form.resetFields(undefined)
    }, [selectedData])

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        const formData = new FormData()
        if (selectedData?.id) formData.append('_method', 'PUT')
        formData.append('post_by', userId)
        formData.append('title', values.title)
        formData.append('content', values.content)
        formData.append('img', values?.img ? values?.img[0].originFileObj : '')
        let result = selectedData != undefined ? PUT(ANNOUNCEMENT.PUT + selectedData.id!, formData) : POST(ANNOUNCEMENT.POST, formData)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).catch((err) => messageApi.open({
            type: 'error',
            content: err.response.data.message ?? err.response.data.error,
            duration: 5
        })).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Announcement`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        {contextHolder}
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Title"
                name="title"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter title...' />
            </FormItem>
            <FormItem
                label="Content"
                name="content"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input.TextArea placeholder='Enter content...' />
            </FormItem>
            <FormItem label="Image"
                name='img'
                valuePropName="fileList" getValueFromEvent={normFile}
            >
                <Upload listType="picture-card" beforeUpload={() => false} accept=".png,.jpeg,.jpg" >
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                </Upload>
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button id={selectedData != undefined ? 'Update' : 'Create'} type="primary" htmlType="submit" loading={loading}>
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button id='cancel' type="primary" onClick={handleCancel} loading={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal >
}

const normFile = (e: any) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
}