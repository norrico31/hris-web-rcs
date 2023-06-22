import { useState, useRef, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom"
import { Button, Col, Row, Modal, Space, Popconfirm, message, TablePaginationConfig, DatePicker, DatePickerProps, Skeleton, Switch, Typography } from "antd"
import styled from "styled-components"
import dayjs, { Dayjs } from "dayjs"
import { RxEnter, RxExit } from 'react-icons/rx'
import { ColumnsType } from "antd/es/table"
import useWindowSize from "../shared/hooks/useWindowSize";
import { Divider, Table } from "../components"
import AvatarPng from '../shared/assets/default_avatar.png'
import { renderTitle } from "../shared/utils/utilities"
import { MessageInstance } from "antd/es/message/interface"
import { useAxios } from './../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from "../shared/constants"
import { useAuthContext } from "../shared/contexts/Auth"
import { IArguments, ITimeKeeping, TimeKeepingRes } from "../shared/interfaces"
import { filterCodes, filterPaths } from "../components/layouts/Sidebar"

const [{ TIMEKEEPING }] = useEndpoints()
const { GET, POST } = useAxios()

const { Title } = Typography

export default function TimeKeeping() {
    renderTitle('Timekeeping')
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<Array<ITimeKeeping>>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [today] = useState(dayjs().format('YYYY-MM-DD'))
    const [selectedDate, setSelectedDate] = useState(today)
    const { width } = useWindowSize()

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])

    useEffect(() => {
        if (!loadingUser && !codes['b01']) return
        const controller = new AbortController();
        if (user) fetchData({ date: today, args: { signal: controller.signal } })
    }, [user, today])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['b01']) return <Navigate to={'/' + paths[0]} />

    const fetchData = ({ args, date = dayjs().format('YYYY-MM-DD') }: { args?: IArguments; date?: Dayjs | string }) => {
        setLoading(true)
        const query = '?from=' + date + '&to=' + date + '&user_id=' + user?.id
        GET<TimeKeepingRes>(TIMEKEEPING.GET + query, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => setData(res?.data ?? [])).finally(() => setLoading(false))
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, pageSize: pagination?.pageSize! }, date: today })

    const handleDatePickerChange: DatePickerProps['onChange'] = (date, dateString) => {
        fetchData({ date: dayjs(date).format('YYYY-MM-DD') })
        setSelectedDate(dayjs(date).format('YYYY-MM-DD'))
    }

    return (
        <>
            <Title level={2} style={{ textAlign: width < 500 ? 'center' : 'initial' }}>Timekeeping</Title>
            <Row wrap justify='space-between'>
                <DatePicker format='YYYY-MM-DD' defaultValue={dayjs()} onChange={handleDatePickerChange} />
                <Button type='primary' size="large" onClick={() => setIsModalOpen(true)} disabled={data.length > 1 || selectedDate != today}>
                    {(data[0] == undefined) ? 'Time In' : 'Time Out'}
                </Button>
            </Row>
            <Divider />
            <Table
                loading={loading}
                columns={width > 500 ? columns : mobileCol}
                dataList={data}
                isSizeChanger={false}
                onChange={onChange}

            />
            <TimeKeepingModal
                data={data}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                handleClose={() => setIsModalOpen(false)}
            />
        </>
    )
}

type ModalProps = {
    isModalOpen: boolean
    fetchData: ({ args, date }: {
        args?: IArguments | undefined;
        date?: string | dayjs.Dayjs | undefined;
    }) => void
    handleClose: () => void
    data: ITimeKeeping[]
}

function TimeKeepingModal({ fetchData, data, isModalOpen, handleClose }: ModalProps) {
    const [isModalVideoOpen, setIsModalVideoOpen] = useState(false)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [mediaError, setMediaError] = useState('')
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [messageApi, contextHolder] = message.useMessage()
    const [loading, setLoading] = useState(false)
    const [clientSite, setClientSite] = useState(false);

    useEffect(() => {
        const handleSuccess = (position: GeolocationPosition) => {
            setError(null)
            const { latitude, longitude } = position.coords
            setCoordinates({ latitude, longitude })
        }

        const handleError = (error: GeolocationPositionError) => {
            setError(error.message + '. Please reload the page and allow geolocation')
            messageApi.open({
                type: 'error',
                content: error.message + '. Please reload the page and allow geolocation',
                duration: 0
            })
        }

        if (!navigator.geolocation) {
            setError("Geolocation is not supported")
            messageApi.open({
                type: 'error',
                content: 'Geolocation is not supported',
                duration: 0
            })
        } else {
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError)
        }
    }, [])

    function postTimeInOut(method: 'timein' | 'timeout') {
        setLoading(true)
        const payload = {
            photo: imageSrc,
            location: coordinates,
            is_client_site: clientSite
        }
        if (payload.photo == null) {
            setError('Please take a selfie photo')
            return
        }
        POST(method == 'timein' ? TIMEKEEPING.TIMEIN : TIMEKEEPING.TIMEOUT, payload)
            .then((res) => {
                fetchData({})
                setImageSrc(null)
                handleClose()
            }).finally(() => {
                setLoading(false)
            })
    }

    if (error == 'Please take a selfie photo') {
        setTimeout(() => setError(''), 2000)
    }

    return <Modal title='Time In/Out' open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
        {contextHolder}
        <Divider />
        <Row justify='center'>
            <Space direction="vertical" align="center">
                <img src={imageSrc ?? AvatarPng} alt='avatar' style={{ maxWidth: '100%' }} />
                <CapturePhotoModal
                    setImageSrc={setImageSrc}
                    setMediaError={setMediaError}
                    isModalVideoOpen={isModalVideoOpen}
                    handleCloseCaptureModal={() => setIsModalVideoOpen(false)}
                    messageApi={messageApi}
                />
                {mediaError}
                {error}
                <Button type='primary' onClick={() => setIsModalVideoOpen(true)} disabled={(!!mediaError || !!error || loading) && error != 'Please take a selfie photo'}>TAKE A SELFIE</Button>
            </Space>
        </Row>
        <Divider style={{ margin: 10 }} />
        <Row justify='space-around' align='middle' style={{ width: '80%', margin: 'auto' }}>
            <Popconfirm
                title={`Time In`}
                description='Are you sure you want to time in?'
                icon={<RxEnter />}
                onConfirm={() => postTimeInOut('timein')}
                okText='Time In'
                disabled={!!mediaError || !!error || loading || !imageSrc || (data?.length > 0 && data?.length < 3) || data?.length > 0}
            >
                <Button
                    type='primary'
                    disabled={!!mediaError || !!error || loading || !imageSrc || (data?.length > 0 && data?.length < 3) || data?.length > 0}
                    loading={loading}
                >
                    Time In
                </Button>
            </Popconfirm>

            <Switch checkedChildren="Client Site" unCheckedChildren="WFH" checked={clientSite} onChange={() => setClientSite(!clientSite)} />

            <Popconfirm
                title={`Time Out`}
                description='Are you sure you want to time out?'
                icon={<RxExit />}
                onConfirm={() => postTimeInOut('timeout')}
                okText='Time Out'
                disabled={!!mediaError || !!error || loading || !imageSrc || data.length == 2 || data?.length == 0}
            >
                <Button
                    type='primary'
                    disabled={!!mediaError || !!error || loading || !imageSrc || data.length == 2 || data?.length == 0}
                    loading={loading}
                >
                    Time Out
                </Button>
            </Popconfirm>
        </Row>
        <Divider />
    </Modal>
}

type CapturePhotoModalProps = {
    setImageSrc: React.Dispatch<React.SetStateAction<string | null>>
    setMediaError: React.Dispatch<React.SetStateAction<string>>
    isModalVideoOpen: boolean
    handleCloseCaptureModal: () => void
    messageApi: MessageInstance
}

function CapturePhotoModal({ isModalVideoOpen, setImageSrc, handleCloseCaptureModal, setMediaError, messageApi }: CapturePhotoModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        let cleanUp = false;
        async function startVideo() {
            setMediaError('')
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (!cleanUp) {
                    streamRef.current = mediaStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream
                        videoRef.current.play()
                    }
                }
            } catch (err) {
                setMediaError('Permission Denied!. Please reload the page and allow camera device')
                messageApi.open({
                    type: 'error',
                    content: 'Permission Denied!. Please reload the page and allow camera device',
                    duration: 0
                })
                handleCloseCaptureModal()
            }
        }
        if (isModalVideoOpen) {
            startVideo()
        }

        return () => {
            cleanUp = true;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
                streamRef.current = null;
            }
        }
    }, [isModalVideoOpen])

    const handleCapture = async () => {
        try {
            if (videoRef.current) {
                const canvas = document.createElement("canvas")
                canvas.width = videoRef.current.videoWidth
                canvas.height = videoRef.current.videoHeight
                const context = canvas.getContext("2d")
                context?.drawImage(videoRef.current, 0, 0)
                const dataUrl = canvas.toDataURL("image/png")
                setImageSrc(dataUrl)
                const stream = videoRef.current.srcObject as MediaStream
                stream?.getTracks().forEach(track => track.stop())
                handleCloseCaptureModal()
            }
        } catch (err) {
            console.error("Error capturing image:", err)
        }
    }

    return <Modal open={isModalVideoOpen} onCancel={handleCloseCaptureModal} footer={null} forceRender>
        <video ref={videoRef} style={{ width: '100%', height: '100%', marginTop: 25 }} />
        <Row justify='center'>
            <Button type='primary' onClick={handleCapture}>Capture</Button>
        </Row>
    </Modal>
}

interface ICol {
    height: number
}

export const Col1 = styled(Col)`
    border: 1px solid #E5E5E5;
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.09), 0 6px 6px rgba(0,0,0,0.15);
`

export const Col2 = styled(Col) <ICol>`
    border: 1px solid #E5E5E5;
    padding: 1.5rem !important;
    max-height: ${(props) => props.height + 'px'};
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.09), 0 6px 6px rgba(0,0,0,0.15);
`

const columns: ColumnsType<ITimeKeeping> = [
    {
        title: 'Date',
        key: 'time_keeping_date',
        dataIndex: 'time_keeping_date',
        width: 150
    },
    {
        title: 'Schedule',
        key: 'schedule',
        dataIndex: 'schedule',
        width: 150,
        render: (_, record) => record?.schedule?.name
    },
    {
        title: 'Time',
        key: 'time_keeping_time',
        dataIndex: 'time_keeping_time',
        width: 150
    },
    {
        title: 'Time Type',
        key: 'type',
        dataIndex: 'type',
        render: (_, record) => record?.type.split('_').join(' ') ?? '-',
        width: 150
    },
    {
        title: 'Client Site',
        key: 'is_client_site',
        dataIndex: 'is_client_site',
        render: (_, record) => record?.is_client_site === 1 ? 'Yes' : 'No',
        width: 150
    },
]

const mobileCol: ColumnsType<ITimeKeeping> = [
    {
        title: 'Date',
        key: 'time_keeping_date',
        dataIndex: 'time_keeping_date',
        width: 150,
        align: 'center'
    },
    {
        title: 'Time',
        key: 'time_keeping_time',
        dataIndex: 'time_keeping_time',
        width: 150,
        align: 'center'
    },
]

