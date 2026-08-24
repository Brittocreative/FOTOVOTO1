import { beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadBlob, shareImage } from './shareImage'

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:result')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})

describe('shareImage', () => {
  it('shares a named PNG file when the browser supports file sharing', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { canShare: () => true, share })

    await expect(shareImage(new Blob(['png'], { type: 'image/png' }))).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      files: [expect.objectContaining({ name: 'adalto-santos-11000.png' })],
    }))
  })

  it('uses download when file sharing is unavailable', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    Object.assign(navigator, { canShare: () => false })

    await expect(shareImage(new Blob(['png'], { type: 'image/png' }))).resolves.toBe('download')
    expect(click).toHaveBeenCalledOnce()
  })
})

describe('downloadBlob', () => {
  it('downloads with the official filename and revokes its URL', () => {
    vi.useFakeTimers()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    downloadBlob(new Blob(['png']), 'adalto-santos-11000.png')
    expect(click).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:result')
    vi.useRealTimers()
  })
})
