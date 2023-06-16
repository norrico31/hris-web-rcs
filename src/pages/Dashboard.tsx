import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Col, Row, Typography, Skeleton, List, Tag, Space, Button, Modal, Descriptions } from 'antd'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { MdExitToApp, MdMoreTime } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'
import { AiOutlineCalendar } from 'react-icons/ai'
import { renderTitle } from "../shared/utils/utilities"
import { Card, Divider } from '../components'
import { useAuthContext } from '../shared/contexts/Auth'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import axiosClient from '../shared/lib/axios'
import { IAnnouncements, IHoliday } from '../shared/interfaces'
import { useDarkMode } from '../shared/contexts/DarkMode'

const { Title } = Typography

const [{ ANNOUNCEMENT, WHOSINOUT, LEAVES, EMPLOYEE201, SYSTEMSETTINGS: { HRSETTINGS: { HOLIDAYS } } }] = useEndpoints()

export default function Dashboard() {
    renderTitle('Dashboard')
    const { user, loading: loadingUser } = useAuthContext()
    const { isDarkMode } = useDarkMode()
    const codes = filterCodes(user?.role?.permissions)
    const [lists, setLists] = useState<{ whosIn: number; whosOut: number; announcements: IAnnouncements[]; leaves: number; employees: number; holidays: IHoliday[] }>({ whosIn: 0, whosOut: 0, announcements: [], leaves: 0, employees: 0, holidays: [] })
    const [loading, setLoading] = useState(true)
    const [isModalAnnouncement, setIsModalAnnouncement] = useState(false)
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<IAnnouncements | undefined>(undefined)
    const holidayEvents = useMemo(() => lists?.holidays?.map((holiday) => ({ title: holiday?.name!, date: holiday?.holiday_date! })), [lists?.holidays])

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            if (user) {
                try {
                    const whosInPromise = axiosClient(WHOSINOUT.IN, { signal: controller.signal })
                    const whosOutPromise = axiosClient(WHOSINOUT.OUT, { signal: controller.signal })
                    const announcementPromise = axiosClient(ANNOUNCEMENT.LISTS, { signal: controller.signal })
                    const leaveTodayPromise = axiosClient(LEAVES.LISTS, { signal: controller.signal }) // add date today
                    const employeePromise = axiosClient(EMPLOYEE201.LISTS, { signal: controller.signal })
                    const holidayPromise = axiosClient(HOLIDAYS.GET, { signal: controller.signal })
                    const [whosInRes, whosOutRes, announcementRes, leaveTodayRes, employeeRes, holidayRes] = await Promise.allSettled([whosInPromise, whosOutPromise, announcementPromise, leaveTodayPromise, employeePromise, holidayPromise]) as any
                    setLists({
                        whosIn: whosInRes?.value?.data?.data?.total ?? 0,
                        whosOut: whosOutRes?.value?.data?.data?.total ?? 0,
                        announcements: announcementRes?.value?.data ?? [],
                        leaves: leaveTodayRes?.value?.data?.data?.total ?? 0,
                        employees: employeeRes?.value?.data?.length ?? 0,
                        holidays: holidayRes?.value?.data?.data?.data ?? []
                    })
                    setLoading(false)
                } catch (error) {
                    console.error('error fetching clients: ', error)
                }
            }
        })()
        return () => {
            controller.abort()
        }
    }, [user])

    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['a01']) {
        if (paths.length > 0) return <Navigate to={'/' + paths[0]} />
        return <Navigate to='/profile' />
    }

    function selectAnnouncement(announcement: IAnnouncements) {
        setIsModalAnnouncement(true)
        setSelectedAnnouncement(announcement)
    }

    function closeAnnouncementModal() {
        setSelectedAnnouncement(undefined)
        setIsModalAnnouncement(false)
    }

    return loading ? <Skeleton /> : (
        <>
            <Title level={2}>Hello {user?.full_name}!</Title>
            <Row justify='space-between' gutter={[24, 24]} wrap>
                <Col xs={24} sm={12} md={12} lg={12} xl={6} >
                    <Card title="Time In" isDarkMode={isDarkMode}>
                        <Row justify='space-between' align='middle'>
                            <Title level={5} style={{ margin: 0 }}><MdMoreTime size={24} /></Title>
                            <Title level={3} style={{ margin: 0 }}>{lists.whosIn}</Title>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card title="Time Out" isDarkMode={isDarkMode}>
                        <Row justify='space-between'>
                            <Title level={5} style={{ margin: 0 }}><MdExitToApp size={24} /></Title>
                            <Title level={3} style={{ margin: 0 }}>{lists.whosOut}</Title>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card title="Today's Leave" isDarkMode={isDarkMode}>
                        <Row justify='space-between'>
                            <Title level={5} style={{ margin: 0 }}><AiOutlineCalendar size={24} /></Title>
                            <Title level={3} style={{ margin: 0 }}>{lists.leaves}</Title>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card title="Employees" isDarkMode={isDarkMode}>
                        <Row justify='space-between'>
                            <Title level={5} style={{ margin: 0 }}><FaUsers size={24} /></Title>
                            <Title level={3} style={{ margin: 0 }}>{lists.employees}</Title>
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Divider />
            <Row justify='space-between' wrap>
                <Col xs={24} sm={24} md={24} lg={14} xl={14} style={{ marginBottom: 15 }}>
                    <Card title='Announcements' style={{ overflowX: 'auto', height: 500 }} isDarkMode={isDarkMode}>
                        <div>
                            {lists.announcements.length > 0 ? (
                                <List
                                    dataSource={lists.announcements}
                                    renderItem={(item: IAnnouncements) => <>
                                        <List.Item key={item?.content}>
                                            <List.Item.Meta
                                                title={<Tag color="#9b3423">{item.title}</Tag>}
                                                description={<div dangerouslySetInnerHTML={{ __html: item?.content.slice(0, 20) + '...' }} />}
                                            />
                                            <Space direction='vertical' align='center'>
                                                <div>{new Date(item.publish_date + '').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                <Button type='primary' size='small' onClick={() => selectAnnouncement(item)}>View</Button>
                                            </Space>
                                        </List.Item>
                                    </>}
                                />
                            ) : <i>No announcements posted</i>}
                            <AnnouncementViewModal
                                isModalOpen={isModalAnnouncement}
                                handleClose={closeAnnouncementModal}
                                selectedAnnouncement={selectedAnnouncement}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={24} lg={9} xl={9} >
                    <Card title='Holidays' isDarkMode={isDarkMode}>
                        <div style={{ overflow: 'auto' }}>
                            <FullCalendar
                                plugins={[
                                    dayGridPlugin,
                                    timeGridPlugin,
                                    interactionPlugin,
                                    listPlugin,
                                ]}
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: "dayGridMonth,timeGridWeek,listMonth",
                                }}
                                initialView="dayGridMonth"
                                editable={true}
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={true}
                                // select={handleDateClick}
                                // eventClick={handleEventClick}
                                events={holidayEvents as any}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

// TODO

function AnnouncementViewModal({ isModalOpen, handleClose, selectedAnnouncement }: any) {
    const [imgSrc, setImgSrc] = useState('')

    useEffect(() => {
        if (selectedAnnouncement) {
            axiosClient.get(ANNOUNCEMENT.GET + '/' + selectedAnnouncement?.id)
                .then((res: any) => {
                    // setImgSrc(res?.data ?? '')
                    console.log(res)
                })
        }
    }, [selectedAnnouncement])

    return <Modal title='Announcement' open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
        <Descriptions bordered column={2}>
            <Descriptions.Item label="Title" span={2} style={{ color: '#626262' }}>{selectedAnnouncement?.title}</Descriptions.Item>
            {/* <Descriptions.Item label="Publish by" span={2} style={{ color: '#626262' }}>{selectedAnnouncement?.posted_by?.name}</Descriptions.Item> */}
            <Descriptions.Item label="Date" span={2} style={{ color: '#626262' }}>{new Date(selectedAnnouncement?.publish_date!).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions bordered layout='vertical'>
            <Descriptions.Item label="Content" style={{ textAlign: 'center', color: '#626262' }}>
                <div style={{ textAlign: 'left' }}>
                    <div dangerouslySetInnerHTML={{ __html: selectedAnnouncement?.content }} />
                </div>
            </Descriptions.Item>
        </Descriptions>
        <Divider />
        <Divider />
        <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={handleClose}>
                Close
            </Button>
        </div>
    </Modal>
}