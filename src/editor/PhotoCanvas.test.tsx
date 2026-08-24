import { act, render } from '@testing-library/react'
import { createRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PhotoCanvas, type PhotoCanvasHandle } from './PhotoCanvas'

const drawImage = vi.fn()
const clearRect = vi.fn()

beforeEach(() => {
  drawImage.mockClear()
  clearRect.mockClear()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    clearRect,
    drawImage,
    save: vi.fn(),
    restore: vi.fn(),
  } as unknown as CanvasRenderingContext2D)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  vi.stubGlobal('Image', class {
    onload: null | (() => void) = null
    naturalWidth = 1080
    naturalHeight = 1080
    set src(_value: string) {
      queueMicrotask(() => this.onload?.())
    }
  })
})

describe('PhotoCanvas', () => {
  it('draws the photo before the fixed frame at 1080 square', async () => {
    const photo = { naturalWidth: 800, naturalHeight: 1200 } as HTMLImageElement
    render(
      <PhotoCanvas
        photo={photo}
        frameUrl="/frames/frame-01.png"
        zoom={1}
        onZoomChange={() => undefined}
        onError={() => undefined}
        onReadyChange={() => undefined}
      />,
    )

    await act(async () => undefined)
    const canvas = document.querySelector('canvas')
    expect(canvas).toHaveAttribute('width', '1080')
    expect(canvas).toHaveAttribute('height', '1080')
    const photoIndex = drawImage.mock.calls.map((call) => call[0]).lastIndexOf(photo)
    const frameIndex = drawImage.mock.calls.reduce(
      (lastIndex: number, call: unknown[], index: number) => call[0] !== photo ? index : lastIndex,
      -1,
    )
    expect(photoIndex).toBeGreaterThanOrEqual(0)
    expect(frameIndex).toBeGreaterThan(photoIndex)
  })

  it('exports the canvas as a PNG blob', async () => {
    const blob = new Blob(['png'], { type: 'image/png' })
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(blob))
    const ref = createRef<PhotoCanvasHandle>()
    render(
      <PhotoCanvas
        ref={ref}
        photo={{ naturalWidth: 1080, naturalHeight: 1080 } as HTMLImageElement}
        frameUrl="/frames/frame-01.png"
        zoom={1}
        onZoomChange={() => undefined}
        onError={() => undefined}
        onReadyChange={() => undefined}
      />,
    )

    await act(async () => undefined)
    await expect(ref.current?.exportBlob()).resolves.toBe(blob)
  })

  it('nudges a landscape photo for precise framing', async () => {
    const ref = createRef<PhotoCanvasHandle>()
    const photo = { naturalWidth: 1200, naturalHeight: 800 } as HTMLImageElement
    render(
      <PhotoCanvas ref={ref} photo={photo} frameUrl="/frames/frame-01.png" zoom={1}
        onZoomChange={() => undefined} onError={() => undefined} onReadyChange={() => undefined} />,
    )
    await act(async () => undefined)
    const before = drawImage.mock.calls.filter((call) => call[0] === photo).at(-1)?.[1]

    act(() => ref.current?.nudge(40, 0))

    const after = drawImage.mock.calls.filter((call) => call[0] === photo).at(-1)?.[1]
    expect(after).toBe(before + 40)
  })
})
