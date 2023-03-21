import { useState, useRef, useEffect } from "react";
import { Button, Calendar, Card, Col, Row, Divider as AntDDivider, Modal, Space, Popconfirm } from "antd";
import styled from "styled-components";
import dayjs, { Dayjs } from "dayjs";
import { RxEnter, RxExit } from 'react-icons/rx'
import { Divider } from "../components/TabHeader"
import AvatarPng from '../shared/assets/default_avatar.png'

export default function TimeKeeping() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const onPanelChange = (value: Dayjs) => {
        console.log(value.format('YYYY-MM-DD'));
    }

    const currentDay = dayjs().format('dddd')
    const currentDate = dayjs().format('MMMM DD')
    return (
        <>
            <MainHeader align='middle' justify='space-between'>
                <Col>
                    <h1 className='color-secondary'>Time Keeping</h1>
                    <h3>{currentDay}</h3>
                    <h2>{currentDate}</h2>
                </Col>
                <Col>
                    <Button className="btn-timeinout" size="large" onClick={() => setIsModalOpen(true)}>
                        <RxEnter />
                        Time in
                    </Button>
                </Col>
            </MainHeader>
            <Divider />
            <Row justify='space-around' wrap>
                <Col xs={24} sm={24} md={14} lg={14} xl={14} style={{ border: '1px solid #E5E5E5' }}>
                    <Calendar onPanelChange={onPanelChange} />
                </Col>
                <Col2 xs={24} sm={24} md={9} lg={9} xl={8}>
                    <h2 style={{ color: '#ABABAB' }}>Time In/Out</h2>
                    <AntDDivider />
                    <Card title="Time in" bordered={false} style={{ width: '100%' }}>
                        <b>06:44 AM</b>
                        <p>March 22</p>
                    </Card>
                    <AntDDivider />
                    <Card title="Time out" bordered={false} style={{ width: '100%' }}>
                        <b>06:44 PM</b>
                        <p>March 22</p>
                    </Card>
                </Col2>
            </Row>
            <TimeKeepingModal
                isModalOpen={isModalOpen}
                handleCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}

type ModalProps = {
    isModalOpen: boolean
    handleCancel: () => void
}

function TimeKeepingModal({ isModalOpen, handleCancel }: ModalProps) {
    const [isModalVideoOpen, setIsModalVideoOpen] = useState(false)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [mediaError, setMediaError] = useState('')
    return <Modal title='Time In/Out' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Divider />
        <Row justify='center'>
            <Space direction="vertical" align="center">
                <img src={imageSrc ?? AvatarPng} alt='avatar' style={{ width: 450 }} />
                <CapturePhotoModal
                    setImageSrc={setImageSrc}
                    setMediaError={setMediaError}
                    isModalVideoOpen={isModalVideoOpen}
                    handleCloseCaptureModal={() => setIsModalVideoOpen(false)}
                />
                {mediaError}
                <Button type='primary' onClick={() => setIsModalVideoOpen(true)} disabled={!!mediaError}>TAKE A SELFIE</Button>
            </Space>
        </Row>
        <Divider style={{ margin: 10 }} />
        <Row justify='space-around' style={{ width: '80%', margin: 'auto' }}>
            <Popconfirm
                title={`Time In`}
                description='Are you sure you want to time in?'
                icon={<RxEnter />}
                onConfirm={() => alert('time in')}
                okText='Time In'
            >
                <Button type='primary' disabled={!!mediaError}>Time In</Button>
            </Popconfirm>
            <Popconfirm
                title={`Time Out`}
                description='Are you sure you want to time out?'
                icon={<RxExit />}
                onConfirm={() => alert('time out')}
                okText='Time Out'
            >
                <Button type='primary' disabled={!!mediaError}>Time Out</Button>
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
}

function CapturePhotoModal({ isModalVideoOpen, setImageSrc, handleCloseCaptureModal, setMediaError }: CapturePhotoModalProps) {
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
                handleCloseCaptureModal()
                console.error("Error accessing camera:", err)
            }
        }
        if (isModalVideoOpen) {
            console.log('aha')
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

const MainHeader = styled(Row)`
    width: 100%;
    background: #9E2813;
    height: 135px;
    padding: 0 3rem;
    border-radius: 8px;

    h2, h3, h4 {
        color: #fff;
    }
    h3 {
        margin-top: 2px;
    }
    .btn-timeinout {
        background: #F9C921;
        border: none;
        color: #fff;
        display: flex;
        align-items: center;
        gap: .5rem;

        svg {
            font-size: 1.5rem !important;
        }
    }
`

const Col2 = styled(Col)`
    border: 1px solid #E5E5E5;
    padding: 1.5rem !important;
    max-height: 500px;
`