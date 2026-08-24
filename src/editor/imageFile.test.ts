import { describe, expect, it, vi } from 'vitest'
import { loadImageFile, validateImageFile } from './imageFile'

describe('validateImageFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s', (type) => {
    expect(validateImageFile(new File(['photo'], 'photo', { type }))).toBeNull()
  })

  it('rejects unsupported files with a useful message', () => {
    const file = new File(['document'], 'document.pdf', { type: 'application/pdf' })
    expect(validateImageFile(file)).toBe('Escolha uma imagem JPG, PNG ou WEBP.')
  })
})

describe('loadImageFile', () => {
  it('decodes locally and revokes the temporary URL', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:photo')
    const decode = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('Image', class {
      src = ''
      naturalWidth = 1200
      naturalHeight = 1600
      decode = decode
    })

    const image = await loadImageFile(new File(['photo'], 'photo.png', { type: 'image/png' }))

    expect(image.src).toBe('blob:photo')
    expect(decode).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:photo')
  })
})
