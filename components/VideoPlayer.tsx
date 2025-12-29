'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  token: string
  userId: string
  lessonId: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export default function VideoPlayer({
  videoUrl,
  token,
  userId,
  lessonId,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const watermarkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Watermarking
  const drawWatermark = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !containerRef.current) return

    const container = containerRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw watermark
    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Dynamic position (change every 5 seconds)
    const position = Math.floor(Date.now() / 5000) % 4
    let x = canvas.width / 2
    let y = canvas.height / 2

    switch (position) {
      case 0:
        x = canvas.width / 2
        y = canvas.height / 2
        break
      case 1:
        x = canvas.width * 0.2
        y = canvas.height * 0.2
        break
      case 2:
        x = canvas.width * 0.8
        y = canvas.height * 0.8
        break
      case 3:
        x = canvas.width * 0.8
        y = canvas.height * 0.2
        break
    }

    ctx.fillText(`User: ${userId.slice(0, 8)}`, x, y)
  }, [userId])

  // Screen capture detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        console.warn('Screen recording detected - page hidden during playback')
        // Optionally pause video or show warning
      }
    }

    const handleFocusChange = () => {
      if (!document.hasFocus() && isPlaying) {
        console.warn('Window lost focus during playback')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleFocusChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleFocusChange)
    }
  }, [isPlaying])

  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Print Screen
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.key === 'PrintScreen')
      ) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      if (video.duration) {
        setDuration(video.duration)
        const progress = (video.currentTime / video.duration) * 100
        onProgress?.(progress)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    const handleEnded = () => {
      setIsPlaying(false)
      onComplete?.()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onProgress, onComplete])

  // Watermark animation
  useEffect(() => {
    watermarkIntervalRef.current = setInterval(drawWatermark, 100)
    return () => {
      if (watermarkIntervalRef.current) {
        clearInterval(watermarkIntervalRef.current)
      }
    }
  }, [drawWatermark])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = newTime
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Construct video URL with token
  const videoSrc = `${videoUrl}?token=${token}`

  return (
    <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-auto"
        controls={false}
        playsInline
        onContextMenu={(e) => e.preventDefault()}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 10 }}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4h4v12H6V4zm4 0h4v12h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.5 4l9 6-9 6V4z" />
              </svg>
            )}
          </button>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  )
}

