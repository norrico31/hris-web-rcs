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

const { GET, DELETE } = useAxios()
const [{ ANNOUNCEMENT }] = useEndpoints()

// TODO: ARCHIVES

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
    // if (!loadingUser && !codes['a01']) { d01 - d04
    //     if (paths.length > 0) return <Navigate to={'/' + paths[0]} />
    //     return <Navigate to='/profile' />
    // }

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
        GET<AnnouncementRes>(ANNOUNCEMENT.GET + '/archives', args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
                <h1 className='color-white'>Announcements - Archives</h1>
            </MainHeader>
            <TabHeader
                handleSearch={handleSearch}
            >
                <Button onClick={() => navigate('/announcements')}>Back to announcements</Button>
            </TabHeader>
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
        </>
    )
}
