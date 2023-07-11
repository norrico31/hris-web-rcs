import { useState, useEffect, useMemo, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Col, Button, Typography, Modal, Divider, Row, DatePicker, Space, Skeleton, Select } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import axios from 'axios'
import { renderTitle } from '../shared/utils/utilities'
import { StyledRow } from './EmployeeEdit'
import useWindowSize from '../shared/hooks/useWindowSize'
import { useAuthContext } from '../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { Table } from '../components'
import { Alert } from '../shared/lib/alert'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import axiosClient, { useAxios } from '../shared/lib/axios'
import { IClient } from '../shared/interfaces'

type Report = { id: string; reports: string }

const [{ HRREPORTS, SYSTEMSETTINGS: { CLIENTSETTINGS } }] = useEndpoints()
const { POST } = useAxios()
// TODO
export default function HrReports() {
    renderTitle('Reports')
    const { user, loading } = useAuthContext()

    const [selectedReport, setSelectedReport] = useState<Report | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])

    if (loading) return <Skeleton />
    if (!loading && !codes['n01']) return <Navigate to={'/' + paths[0]} />

    function handleDownload(url: string) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
    }

    function closeModal() {
        setIsModalOpen(false)
        setSelectedReport(undefined)
    }

    return <>
        <StyledWidthRow>
            <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                <h1 className='color-white'>Reports</h1>
            </Col>
        </StyledWidthRow>
        <Table
            loading={loading}
            columns={renderColumns({
                downloadReport(report: Report) {
                    const key = report.reports
                    const modal: { [k: string]: Function } = {
                        'HR Reports': () => setIsModalOpen(true),
                        'Client Billing Reports': () => setIsModalOpen(true),
                    }
                    setSelectedReport(report)
                    return modal[key]()
                }
            })}
            dataList={dataList}
        />
        <ModalDownload
            isModalOpen={isModalOpen}
            handleClose={closeModal}
            selectedReport={selectedReport}
        />
    </>
}

function StyledWidthRow({ children }: { children: ReactNode }) {
    const { width } = useWindowSize()
    return <StyledRow justify='space-between' wrap align='middle' style={{
        gap: width < 579 ? '.5rem' : 'initial',
        textAlign: width < 579 ? 'center' : 'initial'
    }}>{children}</StyledRow>
}

const { Title } = Typography

const dateVal = [dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD'), dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD')]

//TODO: PLEASE CHANGE THIS URL FOR PROD
const CLIENTBILLINGURL = `https://staging-hrportal.redcoresolutions.com/report/api/billing_report`

function ModalDownload({ selectedReport, isModalOpen, handleClose }: { isModalOpen: boolean; handleClose: () => void; selectedReport?: Report }) {
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<any>(dateVal)
    const [clientId, setClientId] = useState(undefined)
    const [clients, setClients] = useState<IClient[]>([])

    useEffect(() => {
        const controller = new AbortController();
        isModalOpen && (async () => {
            try {
                const clientPromise = await axiosClient(CLIENTSETTINGS.CLIENT.LISTS, { signal: controller.signal })
                setClients(clientPromise?.data ?? [])
            } catch (error: any) {
                throw new Error(error)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [isModalOpen])

    function handleDownload() {
        setLoading(true)
        const start_date = dayjs(date[0]).format('YYYY-MM-DD')
        const end_date = dayjs(date[1]).format('YYYY-MM-DD')
        if (selectedReport?.reports === 'Client Billing Reports') {
            const payload = {
                start_date,
                end_date,
                client_id: clientId
            }

            axiosClient.post(CLIENTBILLINGURL, payload, {
                headers: {
                    'Content-Disposition': "attachment; filename=task_report.xlsx",
                    "Content-Type": "application/json",
                },
                responseType: 'arraybuffer'
            })
                .then((res: any) => {
                    Alert.success('Download Success', 'Client Billing Reports Download Successfully!')
                    const url = window.URL.createObjectURL(new Blob([res.data]))
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `Client Billing Report ${dayjs().format('YYYY-MM-DD')} - ${dayjs().format('YYYY-MM-DD')}.xlsx`)
                    document.body.appendChild(link)
                    setClientId(undefined)
                    link.click()
                    handleClose()
                })
                .catch(err => err)
                .finally(() => {
                    setLoading(false)
                    setDate(dateVal)
                })
        } else {

            const url = `${HRREPORTS.HRREPORTS}?start_date=${start_date}&end_date=${end_date}`
            axios.get(url, {
                headers: {
                    'Content-Disposition': "attachment; filename=task_report.xlsx",
                    "Content-Type": "application/json",
                },
                responseType: 'arraybuffer'
            })
                .then((res: any) => {
                    Alert.success('Download Success', 'Overtime Reports Download Successfully!')
                    const url = window.URL.createObjectURL(new Blob([res.data]))
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `Overtime Reports ${dayjs(start_date).format('YYYY-MM-DD')} - ${dayjs(end_date).format('YYYY-MM-DD')}.xlsx`)
                    document.body.appendChild(link)
                    link.click()
                    handleClose()
                })
                .catch(err => err)
                .finally(() => {
                    setLoading(false)
                    setDate(dateVal)
                })
        }
    }

    return (
        <Modal title={`Download - ${selectedReport?.reports}`} open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
            <Divider />
            <Row justify='space-between'>
                <Title level={5}>Select Date: </Title>
                <DatePicker.RangePicker
                    format='YYYY/MM/DD'
                    onChange={setDate}
                    value={date}
                />
            </Row>
            <Divider style={{ border: 'none', margin: 10 }} />
            {selectedReport?.reports === 'Client Billing Reports' && (
                <Row justify='space-between'>
                    <Title level={5}>Select Client: </Title>
                    <Select
                        placeholder='Select client...'
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        value={clientId}
                        onChange={setClientId}
                        style={{ width: 250 }}
                    >
                        {clients.map((client) => (
                            <Select.Option value={client.id} key={client.id} style={{ color: '#777777' }}>{client.name}</Select.Option>
                        ))}
                    </Select>
                </Row>
            )}
            <Divider style={{ border: 'none', margin: 10 }} />
            <div style={{ textAlign: 'right' }}>
                <Space>
                    <Button id='download' type="primary" loading={loading} disabled={loading} onClick={handleDownload}>
                        Download
                    </Button>
                    <Button id='cancel' type="primary" onClick={handleClose} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </div>
        </Modal>
    )
}

const renderColumns = ({ downloadReport }: { downloadReport: (report: Report) => void; }): ColumnsType<Report> => [
    {
        title: 'Reports',
        key: 'reports',
        dataIndex: 'reports',
        width: 150,
        align: 'center'
    },
    {
        title: 'Action',
        key: 'action',
        dataIndex: 'action',
        align: 'center',
        render: (_, record: Report) => <Button type='primary' onClick={() => downloadReport(record)}>Download</Button>,
        width: 150
    },
]

const dataList = [
    {
        id: '1',
        reports: 'HR Reports'
    },
    {
        id: '2',
        reports: 'Client Billing Reports'
    },
]