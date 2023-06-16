import { useState, useEffect, useMemo } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuthContext } from "../shared/contexts/Auth"
import { Button, Col, Form as AntDForm, Input, Modal, Upload, Skeleton, Space, DatePicker } from "antd"
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { AiOutlineCalendar } from 'react-icons/ai'
import useMessage from "antd/es/message/useMessage"
import { Action, MainHeader, Table, Form, TabHeader } from "../components"
import { renderTitle } from "../shared/utils/utilities"
import { useAxios } from "../shared/lib/axios"
import { ROOTPATHS, useEndpoints } from "../shared/constants"
import { AnnouncementRes, IAnnouncements, IArguments, TableParams } from "../shared/interfaces"
import { filterCodes, filterPaths } from "../components/layouts/Sidebar"
import dayjs from "dayjs"
import { InboxOutlined } from '@ant-design/icons'
import TextEditor from "../components/TextEditor"

const { GET, POST, DELETE } = useAxios()
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
            width: 150
        },
        {
            title: 'Content',
            key: 'content',
            dataIndex: 'content',
            render: (_, record) => <div dangerouslySetInnerHTML={{ __html: record?.content.slice(0, 20) + '...' }} />,
            width: 150
        },
        {
            title: 'Publish Date',
            key: 'publish_date',
            dataIndex: 'publish_date',
            width: 120
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
            />,
            width: 200
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
    const [textFromEditor, setTextFromEditor] = useState('')
    const [messageApi, contextHolder] = useMessage()

    useEffect(() => {
        if (selectedData) {
            form.setFieldsValue({
                ...selectedData,
                file_path: [],
                publish_date: selectedData?.publish_date ? dayjs(selectedData?.publish_date, 'YYYY-MM-DD') : null
            })
            setTextFromEditor(selectedData.content)

        } else {
            form.resetFields(undefined)
            setTextFromEditor('')
        }
    }, [selectedData])

    const key = 'error'
    function onFinish(values: Record<string, any>) {
        if (textFromEditor.length < 5) {
            return messageApi.open({
                key,
                type: 'error',
                content: 'Please enter content!',
                duration: 3,
            })
        }
        setLoading(true)
        const formData = new FormData()
        const publishDate = (values?.publish_date ? dayjs(values?.publish_date).format('YYYY-MM-DD') : '')
        console.log(values.file)
        formData.append('publish_date', publishDate)
        formData.append('posted_by', userId)
        formData.append('title', values.title)
        formData.append('content', textFromEditor)
        formData.append('file', (values?.file !== undefined && values?.file.length > 0) ? values?.file[0].originFileObj : '')
        if (selectedData?.id) formData.append('_method', 'PUT')
        let result = selectedData != undefined ? POST(ANNOUNCEMENT.PUT + selectedData.id!, formData) : POST(ANNOUNCEMENT.POST, formData)
        result.then(() => {
            form.resetFields()
            setTextFromEditor('')
            handleCancel()
        }).catch((err) => {
            messageApi.open({
                type: 'error',
                content: err.response.data.message ?? err.response.data.error,
                duration: 3,
                key
            })
            setLoading(false)
        }).finally(() => {
            setLoading(false)
            fetchData()
        })
    }

    function handleDownload() {
        // TODO: Logic to retrieve the file URL or data

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = ANNOUNCEMENT.DOWNLOAD + `${selectedData?.id}`; // Replace 'your_file_url' with the actual file URL or data URL
        link.target = '_blank';

        // Trigger the download
        link.click();
    }

    return <Modal title={`${title} - Announcement`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender width={1000}>
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
            {/* <FormItem
                label="Content"
                name="content"
                required
                rules={[{ required: true, message: 'Required' }]}
                >
                <Input.TextArea placeholder='Enter content...' />
            </FormItem> */}
            <FormItem
                label="Content"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <TextEditor
                    textFromEditor={textFromEditor}
                    setTextFromEditor={setTextFromEditor}
                />
            </FormItem>
            <FormItem
                label="Publish Date"
                name="publish_date"
            >
                <DatePicker
                    format='YYYY/MM/DD'
                    style={{ width: '100%' }}
                />
            </FormItem>
            <FormItem label="Attachment">
                <FormItem name="file" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                    <Upload.Dragger name="files" beforeUpload={() => false}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Upload.Dragger>
                </FormItem>
            </FormItem>
            {selectedData && selectedData.file_name && (
                <FormItem>
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ marginBottom: 8 }}>Download</span>
                            <a href={selectedData.file_name} onClick={(e) => { e.preventDefault(); handleDownload(); }}>
                                {selectedData.file_name}
                            </a>
                        </div>
                    </div>
                </FormItem>
            )}
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button id={selectedData != undefined ? 'Update' : 'Create'} type="primary" htmlType="submit" loading={loading}>
                        {selectedData != undefined ? 'Edit' : 'Submit'}
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