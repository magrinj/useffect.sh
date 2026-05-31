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
}

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onResult: (result: HandLandmarkerResult) => void,
  active: boolean,
) {
  const [state, setState] = useState<HandTrackingState>({
    status: 'idle',
    error: null,
  })

  const callbackRef = useRef(onResult)
  callbackRef.current = onResult

  // `active` toggling (e.g. scroll in/out of view) must pause/resume the camera
  // WITHOUT re-running the setup effect, otherwise the expensive WASM
  // landmarker would be torn down and rebuilt each time. We funnel toggles
  // through a ref + the same sync() the visibility listeners use.
  const activeRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})

  useEffect(() => {
    let cancelled = false
    let landmarker: HandLandmarker | null = null
    let stream: MediaStream | null = null
    let rafId = 0
    let lastVideoTime = -1
    let starting = false

    const isPageActive = () => !document.hidden && document.hasFocus()
    const shouldRun = () => activeRef.current && isPageActive()

    async function ensureLandmarker() {
      if (landmarker) return landmarker
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE)
      landmarker = await HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        // The carousel only ever uses the largest hand (see pickHand), so
        // tracking a single hand roughly halves the per-frame inference cost.
        numHands: 1,
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
      return landmarker
    }

    async function start() {
      if (cancelled || starting || stream) return
      starting = true
      setState((s) => ({ ...s, status: 'loading' }))
      try {
        await ensureLandmarker()
        if (cancelled || !shouldRun()) return
        // 640×480 is plenty for landmark detection and cuts the texture upload
        // / model input cost dramatically versus 720p.
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
        // Bail out if visibility/focus/active flipped while we were awaiting media.
        if (cancelled || !shouldRun()) {
          for (const track of localStream.getTracks()) track.stop()
          return
        }
        stream = localStream
        const video = videoRef.current
        if (!video) {
          for (const track of stream.getTracks()) track.stop()
          stream = null
          return
        }
        video.srcObject = stream
        await video.play()

        setState({ status: 'ready', error: null })
        lastVideoTime = -1

        const loop = () => {
          if (cancelled || !landmarker || !stream || !video) return
          if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
            lastVideoTime = video.currentTime
            const result = landmarker.detectForVideo(video, performance.now())
            // Deliver results via the callback only — never through React
            // state, which would re-render the camera subtree every frame.
            callbackRef.current(result)
          }
          rafId = requestAnimationFrame(loop)
        }
        rafId = requestAnimationFrame(loop)
      } catch (err) {
        if (cancelled) return
        setState({
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
        })
      } finally {
        starting = false
      }
    }

    function stop() {
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
      const video = videoRef.current
      if (video) {
        video.pause()
        video.srcObject = null
      }
      if (stream) {
        for (const track of stream.getTracks()) track.stop()
        stream = null
      }
      lastVideoTime = -1
    }

    const sync = () => {
      if (cancelled) return
      if (shouldRun()) {
        start()
      } else if (stream || rafId) {
        stop()
        setState((s) => ({ ...s, status: 'idle' }))
      }
    }
    syncRef.current = sync

    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    window.addEventListener('blur', sync)

    // Initial start only checks visibility — some browsers (notably Safari)
    // return document.hasFocus() === false until the user first interacts
    // with the page, which would leave the camera permanently off on cold
    // load. Subsequent blur/focus events still drive pause/resume.
    if (activeRef.current && !document.hidden) start()

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
      window.removeEventListener('blur', sync)
      stop()
      landmarker?.close()
      landmarker = null
    }
  }, [videoRef])

  // Toggle the stream on/off as `active` changes (scrolling the carousel in or
  // out of view) — reusing sync() so the landmarker is never rebuilt.
  useEffect(() => {
    activeRef.current = active
    syncRef.current()
  }, [active])

  return state
}
