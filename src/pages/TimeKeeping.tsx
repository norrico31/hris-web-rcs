import { useState, useRef, useEffect } from "react";

export default function TimeKeeping() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [imageSrc, setImageSrc] = useState<string>("");
    const [mediaError, setMediaError] = useState('')


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
                console.error("Error accessing camera:", err)
            }
        }
        startVideo()

        return () => {
            cleanUp = true;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
                streamRef.current = null;
            }
        }
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
