import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Popconfirm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { BiRefresh } from 'react-icons/bi'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { IArguments, ISalaryRates, SalaryRatesRes, TableParams } from '../../../shared/interfaces'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

export default function SalaryRates() {
    const [data, setData] = useState<ISalaryRates[]>([])
    const [selectedData, setSelectedData] = useState<ISalaryRates | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isArchive, setIsArchive] = useState(false)

    useEffect(function () {
        const controller = new AbortController();
        fetchData({
            signal: controller.signal,
            search,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize,
            isArchive
        })
        return () => {
            controller.abort()
        }
    }, [isArchive, search])

    const columns: ColumnsType<ISalaryRates> = [
        {
            title: 'Salary Rates',
            key: 'rate',
            dataIndex: 'rate',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: ISalaryRates) => !isArchive ? <Action
                title='SalaryRates'
                name={record.rate}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            /> : <Popconfirm
                title={`Restore salary rate`}
                description={`Are you sure you want to restore ${record?.rate}?`}
                onConfirm={() => {
                    GET(HRSETTINGS.SALARYRATES.RESTORE + record?.id)
                        .then((res) => console.log(res))
                        .finally(() => fetchData({
                            search,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize,
                            isArchive
                        }))
                }}
                okText="Restore"
                cancelText="Cancel"
            >
                <Button id='restore' type='primary' size='middle' onClick={() => null}>
                    <Space align='center'>
                        <BiRefresh />
                        Restore
                    </Space>
                </Button>
            </Popconfirm>,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        let url = args?.isArchive ? (HRSETTINGS.SALARYRATES.GET + '/archives') : HRSETTINGS.SALARYRATES.GET;
        GET<SalaryRatesRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize!, isArchive })

    function handleDelete(id: string) {
        DELETE(HRSETTINGS.SALARYRATES.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ISalaryRates) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title={`Salary Rates ${isArchive ? '- Archives' : ''}`}>
            <TabHeader
                handleSearch={setSearch}
                handleCreate={!isArchive ? () => setIsModalOpen(true) : undefined}
                handleModalArchive={!isArchive ? () => setIsArchive(true) : undefined}
            >
                {isArchive ? <Button onClick={() => setIsArchive(false)}>Back to salary rates</Button> : null}
            </TabHeader>
            {!isArchive ? (
                <>
                    <Table
                        loading={loading}
                        columns={columns}
                        dataList={data}
                        tableParams={tableParams}
                        onChange={onChange}
                    />
                    <SalaryRatesModal
                        title={selectedData != undefined ? 'Update' : 'Create'}
                        selectedData={selectedData}
                        isModalOpen={isModalOpen}
                        handleCancel={handleCloseModal}
                        fetchData={fetchData}
                    />
                </>
            ) : (<Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />)}
        </Card>
    )
}

interface ModalProps {
    title: string
    isModalOpen: boolean
    selectedData?: ISalaryRates
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function SalaryRatesModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<ISalaryRates>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ISalaryRates) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(HRSETTINGS.SALARYRATES.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(HRSETTINGS.SALARYRATES.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Salary Rates`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Salary Rate"
                name="rate"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter salary rate...' />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input placeholder='Enter Description...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}