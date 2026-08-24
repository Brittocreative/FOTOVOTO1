export const PHOTO_FILENAME = 'adalto-santos-11000.png'

export function downloadBlob(blob: Blob, filename = PHOTO_FILENAME): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

export async function shareImage(blob: Blob): Promise<'shared' | 'download'> {
  const file = new File([blob], PHOTO_FILENAME, { type: 'image/png' })
  const data: ShareData = {
    title: 'Eu estou com Adalto Santos 11000',
    text: 'Fé, trabalho e cuidado com as pessoas. Adalto Santos 11000.',
    files: [file],
  }

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share(data)
    return 'shared'
  }

  downloadBlob(blob)
  return 'download'
}
