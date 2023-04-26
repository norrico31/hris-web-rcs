import { useState, useRef, useEffect } from "react";
import { Button, Calendar, Col, Row, Divider as AntDDivider, Modal, Space, Popconfirm, message } from "antd"
import styled from "styled-components"
import dayjs, { Dayjs } from "dayjs"
import { RxEnter, RxExit } from 'react-icons/rx'
import { MainHeader, Divider, Box } from "../components"
import AvatarPng from '../shared/assets/default_avatar.png'
import { renderTitle } from "../shared/utils/utilities"
import { MessageInstance } from "antd/es/message/interface"
import { useAxios } from './../shared/lib/axios'
import { useEndpoints } from "../shared/constants"
import { useAuthContext } from "../shared/contexts/Auth";

const [{ TIMEKEEPING }] = useEndpoints()
const { GET, POST } = useAxios()

export default function TimeKeeping() {
    renderTitle('Timekeeping')
    const { user } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)

    // useEffect(() => {
    //     fetchData()
    // }, [])

    const currentDay = dayjs().format('dddd')
    const currentDate = dayjs().format('MMMM DD')

    function fetchData() {
        const today = dayjs().format('YYYY-MM-DD')
        GET(TIMEKEEPING.GET + '?from=' + today + '&to=' + today + '&user_id=' + user?.id + '&limit=10')
            .then((res) => {
                console.log('get results: ', res)
            })
    }

    const onPanelChange = (value: Dayjs) => {
        console.log(value.format('YYYY-MM-DD'));
    }

    return (
        <>
            <MainHeader>
                <Space wrap>
                    <h1 className='color-white'>Time Keeping</h1>
                </Space>
                <Col>
                    <Button className="btn-timeinout" size="large" onClick={() => setIsModalOpen(true)}>
                        <RxEnter />
                        Time in
                    </Button>
                </Col>
            </MainHeader>
            <Row justify='space-around' wrap>
                <Col1 xs={24} sm={24} md={14} lg={14} xl={14}>
                    <Calendar onPanelChange={onPanelChange} />
                </Col1>
                <Col2 xs={24} sm={24} md={9} lg={9} xl={8} height={500}>
                    <h2 style={{ color: '#ABABAB' }}>Time In/Out</h2>
                    <AntDDivider />
                    <Box title="Time in">
                        <b>06:44 AM</b>
                        <p>March 22</p>
                    </Box>
                </Col2>
            </Row>
            <TimeKeepingModal
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                handleClose={() => setIsModalOpen(false)}
            />
        </>
    )
}

type ModalProps = {
    isModalOpen: boolean
    fetchData(): void
    handleClose: () => void
}

function TimeKeepingModal({ fetchData, isModalOpen, handleClose }: ModalProps) {
    const [isModalVideoOpen, setIsModalVideoOpen] = useState(false)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [mediaError, setMediaError] = useState('')
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [messageApi, contextHolder] = message.useMessage()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const handleSuccess = (position: GeolocationPosition) => {
            setError(null)
            const { latitude, longitude } = position.coords
            setCoordinates({ latitude, longitude })
        }

        const handleError = (error: GeolocationPositionError) => {
            console.log(error)
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

    // TODO

    function postTimeInOut(method: 'timein' | 'timeout') {
        setLoading(true)
        const payload = {
            photo: imageSrc,
            location: coordinates
        }
        if (payload.photo == null) {
            setError('Please take a selfie photo')
            return
        }
        POST(method == 'timein' ? TIMEKEEPING.TIMEIN : TIMEKEEPING.TIMEOUT, payload)
            .then((res) => {
                console.log(res?.data.data)
                fetchData()
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
                <img src={imageSrc ?? AvatarPng} alt='avatar' style={{ maxWidth: 400 }} />
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
        <Row justify='space-around' style={{ width: '80%', margin: 'auto' }}>
            <Popconfirm
                title={`Time In`}
                description='Are you sure you want to time in?'
                icon={<RxEnter />}
                onConfirm={() => postTimeInOut('timein')}
                okText='Time In'
            >
                <Button
                    type='primary'
                    disabled={!!mediaError || !!error || loading}
                    loading={loading}
                >
                    Time In
                </Button>
            </Popconfirm>
            <Popconfirm
                title={`Time Out`}
                description='Are you sure you want to time out?'
                icon={<RxExit />}
                onConfirm={() => postTimeInOut('timeout')}
                okText='Time Out'
            >
                <Button
                    type='primary'
                    disabled={!!mediaError || !!error || loading}
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
                console.error("Error accessing camera:", err)
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
        <video ref={videoRef} style={{ width: 470, height: 350, marginTop: 25 }} />
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