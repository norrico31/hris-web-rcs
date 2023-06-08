import { useState, useEffect, ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Tabs as AntDTabs, Col, Button, Typography, Modal, Divider, Row, Select, DatePicker, Space } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import axios from 'axios'
import styled from 'styled-components'
import { renderTitle } from '../shared/utils/utilities'
import { StyledRow } from './EmployeeEdit'
import useWindowSize from '../shared/hooks/useWindowSize'
import { useAuthContext } from '../shared/contexts/Auth'
import { filterCodes } from '../components/layouts/Sidebar'
import { Table } from '../components'
import { Alert } from '../shared/lib/alert'
import { useEndpoints } from '../shared/constants'

type Report = { id: string; reports: string }

const initModalState = {
    isModalWithDate: false,
    isModalWODate: false
}
const [{ HRREPORTS }] = useEndpoints()

export default function HrReports() {
    renderTitle('HR Reports')
    const { user, loading } = useAuthContext()
    let { pathname } = useLocation()
    const navigate = useNavigate()
    const pathKey = pathname.split('/').pop()
    const codes = filterCodes(user?.role?.permissions)

    const [selectedReport, setSelectedReport] = useState<Report | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(initModalState)

    // useEffect(() => {
    //     if (pathname == '/leave/approval' && !codes['c06']) return navigate('/leave/myleaves')
    // }, [])

    // experiment shit

    return <>
        <StyledWidthRow>
            <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                <h1 className='color-white'>HR Reports</h1>
            </Col>
        </StyledWidthRow>
        {/* <h2>Work in progress</h2> */}
        <Table
            loading={loading}
            columns={renderColumns({
                downloadReport(report: Report) {
                    const key = report.reports
                    const modal: { [k: string]: Function } = {
                        'Attendance Reports': () => setIsModalOpen({ ...isModalOpen, isModalWODate: true }),
                        'Client Billing Reports': () => setIsModalOpen({ ...isModalOpen, isModalWODate: true }),
                        'Daily Task Reports': () => setIsModalOpen({ ...isModalOpen, isModalWODate: true }),
                        'Overtime Reports': () => setIsModalOpen({ ...isModalOpen, isModalWithDate: true }),
                    }
                    setSelectedReport(report)
                    return modal[key]()
                }
            })}
            dataList={dataList}
        // tableParams={tableParams}
        // onChange={onChange}
        />
        <ModalDownload
            isModalOpen={isModalOpen.isModalWithDate}
            handleClose={() => setIsModalOpen(initModalState)}
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

function ModalDownload({ selectedReport, isModalOpen, handleClose }: { isModalOpen: boolean; handleClose: () => void; selectedReport?: Report }) {
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<any>(dateVal)

    function handleDownload() {
        setLoading(true)
        const start_date = dayjs(date[0]).format('YYYY-MM-DD')
        const end_date = dayjs(date[1]).format('YYYY-MM-DD')
        axios.post(HRREPORTS.OVERTIME, JSON.stringify({ // URL must change
            start_date,
            end_date,
        }), {
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
                link.setAttribute('download', `Tasks ${dayjs(start_date).format('YYYY-MM-DD')} - ${dayjs(end_date).format('YYYY-MM-DD')}.xlsx`)
                document.body.appendChild(link)
                link.click()
                handleClose()
            })
            .catch(err => {
                console.log('error to: ', err)
            })
            .finally(() => {
                setLoading(false)
                setDate(dateVal)
            })
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
        reports: 'Attendance Reports'
    },
    {
        id: '2',
        reports: 'Client Billing Reports'
    },
    {
        id: '3',
        reports: 'Daily Task Reports'
    },
    {
        id: '4',
        reports: 'Overtime Reports'
    },
]