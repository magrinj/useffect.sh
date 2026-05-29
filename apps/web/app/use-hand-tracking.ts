'use client'

import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision'
import { useEffect, useRef, useState } from 'react'

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

export type HandTrackingState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  result: HandLandmarkerResult | null
}

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onResult: (result: HandLandmarkerResult) => void,
) {
  const [state, setState] = useState<HandTrackingState>({
    status: 'idle',
    error: null,
    result: null,
  })

  const callbackRef = useRef(onResult)
  callbackRef.current = onResult

  useEffect(() => {
    let cancelled = false
    let landmarker: HandLandmarker | null = null
    let stream: MediaStream | null = null
    let rafId = 0
    let lastVideoTime = -1

    async function boot() {
      setState((s) => ({ ...s, status: 'loading' }))
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_BASE)
        landmarker = await HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          numHands: 2,
          runningMode: 'VIDEO',
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: false,
        })

        const video = videoRef.current
        if (!video || cancelled) return
        video.srcObject = stream
        await video.play()

        setState({ status: 'ready', error: null, result: null })

        const loop = () => {
          if (cancelled || !landmarker || !video) return
          if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
            lastVideoTime = video.currentTime
            const result = landmarker.detectForVideo(video, performance.now())
            callbackRef.current(result)
            setState((s) => ({ ...s, result }))
          }
          rafId = requestAnimationFrame(loop)
        }
        rafId = requestAnimationFrame(loop)
      } catch (err) {
        if (cancelled) return
        setState({
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
          result: null,
        })
      }
    }

    boot()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      landmarker?.close()
      for (const track of stream?.getTracks() ?? []) track.stop()
    }
  }, [videoRef])

  return state
}
