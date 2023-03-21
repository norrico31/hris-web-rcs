import { useState, useRef, useEffect } from "react";

export default function TimeKeeping() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [imageSrc, setImageSrc] = useState<string>("");
    const [mediaError, setMediaError] = useState('')
    console.log(mediaError)
    useEffect(() => {
        async function startVideo() {
            setMediaError('')
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play()
                }
            } catch (err) {
                setMediaError('Permission Denied!. Please reload the page and allow camera device')
                console.error("Error accessing camera:", err)
            }
        }
        startVideo()
    }, [])

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
            }
        } catch (err) {
            console.error("Error capturing image:", err)
        }
    };
    console.log(mediaError)
    return (
        <div>
            <h1 style={{ fontSize: 100 }}>Time Keeping</h1>
            {mediaError && (<h2 style={{ color: 'red' }}>{mediaError}</h2>)}
            <video ref={videoRef} style={{ display: "block" }}></video>
            <button onClick={handleCapture}>Capture Image</button>
            {imageSrc && <img src={imageSrc} />}
        </div>
    );
}
