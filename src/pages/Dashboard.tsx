import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Col, Row, Card as AntDCard, Typography, Calendar, Skeleton, Divider as AntDDivider, Badge, BadgeProps } from 'antd'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { MdExitToApp, MdMoreTime } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'
import { EventClickArg } from '@fullcalendar/core'
import { AiOutlineCalendar } from 'react-icons/ai'
import { renderTitle } from "../shared/utils/utilities"
import { Card, Divider } from '../components'
import { useAuthContext } from '../shared/contexts/Auth'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import axiosClient, { useAxios } from '../shared/lib/axios'
import { IHoliday } from '../shared/interfaces'

const { Paragraph, Title } = Typography

const [{ ANNOUNCEMENT, WHOSINOUT, LEAVES, EMPLOYEE201, SYSTEMSETTINGS: { HRSETTINGS: { HOLIDAYS } } }] = useEndpoints()
const { GET } = useAxios()

export default function Dashboard() {
    renderTitle('Dashboard')
    const { user, loading: loadingUser } = useAuthContext()
    const codes = filterCodes(user?.role?.permissions)
    const [lists, setLists] = useState<{ whosIn: number; whosOut: number; announcements: any[]; leaves: number; employees: number; holidays: IHoliday[] }>({ whosIn: 0, whosOut: 0, announcements: [], leaves: 0, employees: 0, holidays: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const whosInPromise = axiosClient(WHOSINOUT.IN, { signal: controller.signal })
                const whosOutPromise = axiosClient(WHOSINOUT.OUT, { signal: controller.signal })
                const announcementPromise = axiosClient(ANNOUNCEMENT.LISTS, { signal: controller.signal })
                const leaveTodayPromise = axiosClient(LEAVES.LISTS, { signal: controller.signal }) // add date today
                const employeePromise = axiosClient(EMPLOYEE201.LISTS, { signal: controller.signal })
                const holidayPromise = axiosClient(HOLIDAYS.GET, { signal: controller.signal })
                const [whosInRes, whosOutRes, announcementRes, leaveTodayRes, employeeRes, holidayRes] = await Promise.allSettled([whosInPromise, whosOutPromise, announcementPromise, leaveTodayPromise, employeePromise, holidayPromise]) as any
                console.log(employeeRes?.value)
                setLists({
                    whosIn: whosInRes?.value?.data?.data?.total ?? 0,
                    whosOut: whosOutRes?.value?.data?.data?.total ?? 0,
                    announcements: announcementRes?.value?.data?.data?.data ?? [],
                    leaves: leaveTodayRes?.value?.data?.data?.total ?? 0,
                    employees: employeeRes?.value?.data?.length ?? 0,
                    holidays: holidayRes?.value?.data?.data?.data ?? []
                })
                setLoading(false)
            } catch (error) {
                console.error('error fetching clients: ', error)
            }
        })()
    }, [])

    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['a01']) {
        if (paths.length > 0) return <Navigate to={'/' + paths[0]} />
        return <Navigate to='/profile' />
    }

    const handleDateClick = (selected: any) => {
        const title = prompt('Please enter a new title for your event')
        const calendarApi = selected.view.calendar
        calendarApi.unselect()

        if (title) {
            calendarApi.addEvent({
                id: `${selected.dateStr}-${selected.title}`,
                title,
                start: selected.startStr,
                end: selected.endStr,
                allDay: selected.allday
            })
        }
    }

    const handleEventClick = (selected: EventClickArg) => {
        alert(selected.event.title)
    }
    const holidayEvents = lists?.holidays?.map((holiday) => ({ title: holiday?.name!, date: holiday?.holiday_date! }))

    return loading ? <Skeleton /> : (
        <>
            <Title level={2}>Hello {user?.full_name}!</Title>
            <Row justify='space-between' gutter={[24, 24]} wrap>
                <Col xs={24} sm={12} md={12} lg={12} xl={6} >
                    <Card title="Time In">
                        <Row justify='space-between' align='middle'>
                            <Title level={5} style={{ margin: 0 }}><MdMoreTime size={24} /></Title>
                            <Title level={3} style={{ margin: 0 }}>{lists.whosIn}</Title>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card title="Time Out">
                        <Row justify='space-between'>
                            <Title level={5} style={{ margin: 0 }}><MdExitToApp size={24} /></Title>
                            <Title level={3} style={{ margin: 0 }}>{lists.whosOut}</Title>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card title="Today's Leave">
                        <Row justify='space-between'>
                            <Title level={5} style={{ margin: 0 }}><AiOutlineCalendar size={24} /></Title>
                            <Title level={3} style={{ margin: 0 }}>{lists.leaves}</Title>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card title="Employees">
                        <Row justify='space-between'>
                            <Title level={5} style={{ margin: 0 }}><FaUsers size={24} /></Title>
                            <Title level={3} style={{ margin: 0 }}>{lists.employees}</Title>
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Row justify='space-between' wrap>
                <Divider />
                <Col xs={24} sm={24} md={22} lg={9} xl={9}>
                    <AntDCard title='Announcements' style={{ minHeight: 500, maxHeight: 500 }}>
                    </AntDCard>
                </Col>
                <Col xs={24} sm={24} md={22} lg={14} xl={14}>
                    <Card title='Holidays'>
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
                                select={handleDateClick}
                                eventClick={handleEventClick}
                                events={holidayEvents as any}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
        </>
    )
}