import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { clampTransform, coverScale, type Point, type Transform } from './geometry'

const CANVAS_SIZE = 1080

export type PhotoCanvasHandle = {
  exportBlob: () => Promise<Blob>
  nudge: (x: number, y: number) => void
}

type PhotoCanvasProps = {
  photo: HTMLImageElement | null
  frameUrl: string
  zoom: number
  onZoomChange: (value: number) => void
  onError: (message: string) => void
  onReadyChange: (ready: boolean) => void
}

export const PhotoCanvas = forwardRef<PhotoCanvasHandle, PhotoCanvasProps>(
  function PhotoCanvas(
    { photo, frameUrl, zoom, onZoomChange, onError, onReadyChange },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const frameRef = useRef<HTMLImageElement | null>(null)
    const pointersRef = useRef(new Map<number, Point>())
    const lastCenterRef = useRef<Point | null>(null)
    const lastDistanceRef = useRef<number | null>(null)
    const [frameReady, setFrameReady] = useState(false)
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 })
    const minimumScale = photo
      ? coverScale(
          { width: photo.naturalWidth, height: photo.naturalHeight },
          { width: CANVAS_SIZE, height: CANVAS_SIZE },
        )
      : 1

    useEffect(() => {
      const frame = new Image()
      frame.onload = () => {
        frameRef.current = frame
        setFrameReady(true)
      }
      frame.onerror = () => {
        frameRef.current = null
        setFrameReady(false)
        onError('Não foi possível carregar esta moldura. Escolha outra opção.')
      }
      frame.src = frameUrl
      return () => {
        frame.onload = null
        frame.onerror = null
      }
    }, [frameUrl, onError])

    useEffect(() => {
      if (!photo) {
        setTransform({ x: 0, y: 0, scale: 1 })
        onReadyChange(false)
        return
      }
      setTransform({ x: 0, y: 0, scale: minimumScale * zoom })
      onReadyChange(true)
    }, [photo, minimumScale, onReadyChange])

    useEffect(() => {
      if (!photo) return
      setTransform((current) =>
        clampTransform(
          { ...current, scale: minimumScale * zoom },
          { width: photo.naturalWidth, height: photo.naturalHeight },
          { width: CANVAS_SIZE, height: CANVAS_SIZE },
          minimumScale,
        ),
      )
    }, [photo, zoom, minimumScale])

    useEffect(() => {
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      if (!canvas || !context) return

      const draw = () => {
        context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
        if (photo) {
          const width = photo.naturalWidth * transform.scale
          const height = photo.naturalHeight * transform.scale
          context.drawImage(
            photo,
            (CANVAS_SIZE - width) / 2 + transform.x,
            (CANVAS_SIZE - height) / 2 + transform.y,
            width,
            height,
          )
        }
        if (frameReady && frameRef.current) {
          context.drawImage(frameRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
        }
      }
      requestAnimationFrame(draw)
    }, [photo, transform, frameReady, frameUrl])

    useImperativeHandle(ref, () => ({
      nudge: (x, y) => {
        if (!photo) return
        setTransform((current) => clampTransform(
          { ...current, x: current.x + x, y: current.y + y },
          { width: photo.naturalWidth, height: photo.naturalHeight },
          { width: CANVAS_SIZE, height: CANVAS_SIZE },
          minimumScale,
        ))
      },
      exportBlob: () =>
        new Promise((resolve, reject) => {
          const canvas = canvasRef.current
          if (!canvas) {
            reject(new Error('Canvas indisponível'))
            return
          }
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Não foi possível gerar sua foto.'))
          }, 'image/png')
        }),
    }), [photo, minimumScale])

    const canvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
      const rect = event.currentTarget.getBoundingClientRect()
      return {
        x: ((event.clientX - rect.left) / rect.width) * CANVAS_SIZE,
        y: ((event.clientY - rect.top) / rect.height) * CANVAS_SIZE,
      }
    }

    const updateGesture = () => {
      if (!photo) return
      const points = [...pointersRef.current.values()]
      if (points.length === 1) {
        lastCenterRef.current = points[0]
        lastDistanceRef.current = null
        return
      }
      if (points.length >= 2) {
        const center = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
        const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
        lastCenterRef.current = center
        lastDistanceRef.current = distance
      }
    }

    const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!photo) return
      event.currentTarget.setPointerCapture(event.pointerId)
      pointersRef.current.set(event.pointerId, canvasPoint(event))
      updateGesture()
    }

    const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!photo || !pointersRef.current.has(event.pointerId)) return
      const previousCenter = lastCenterRef.current
      const previousDistance = lastDistanceRef.current
      pointersRef.current.set(event.pointerId, canvasPoint(event))
      const points = [...pointersRef.current.values()]
      const nextCenter = points.length >= 2
        ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
        : points[0]
      const nextDistance = points.length >= 2
        ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
        : null

      setTransform((current) => {
        let next = {
          ...current,
          x: current.x + (previousCenter ? nextCenter.x - previousCenter.x : 0),
          y: current.y + (previousCenter ? nextCenter.y - previousCenter.y : 0),
        }
        if (nextDistance && previousDistance) {
          const factor = nextDistance / previousDistance
          next.scale = Math.max(minimumScale, Math.min(minimumScale * 3, current.scale * factor))
          onZoomChange(next.scale / minimumScale)
        }
        return clampTransform(next, photo, { width: CANVAS_SIZE, height: CANVAS_SIZE }, minimumScale)
      })
      lastCenterRef.current = nextCenter
      lastDistanceRef.current = nextDistance
    }

    const handlePointerEnd = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      pointersRef.current.delete(event.pointerId)
      updateGesture()
    }

    const handleWheel = (event: ReactWheelEvent<HTMLCanvasElement>) => {
      if (!photo) return
      event.preventDefault()
      onZoomChange(Math.max(1, Math.min(3, zoom + (event.deltaY < 0 ? 0.08 : -0.08))))
    }

    return (
      <div className="canvas-shell" aria-label="Editor da foto">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          aria-label={photo ? 'Prévia da sua foto com a moldura selecionada' : 'Prévia da moldura selecionada'}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onWheel={handleWheel}
        />
        {!photo && (
          <div className="canvas-empty" aria-hidden="true">
            <span>1</span>
            <strong>Escolha uma foto</strong>
            <small>Ela aparecerá aqui para você ajustar.</small>
          </div>
        )}
      </div>
    )
  },
)
