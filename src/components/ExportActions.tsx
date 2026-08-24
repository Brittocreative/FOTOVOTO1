import { useState } from 'react'
import { downloadBlob, shareImage } from '../export/shareImage'

type Props = {
  disabled: boolean
  exportImage: () => Promise<Blob>
  onMessage: (message: string) => void
}

export function ExportActions({ disabled, exportImage, onMessage }: Props) {
  const [busy, setBusy] = useState<'share' | 'download' | null>(null)

  const run = async (action: 'share' | 'download') => {
    setBusy(action)
    try {
      const blob = await exportImage()
      if (action === 'share') {
        const result = await shareImage(blob)
        onMessage(result === 'shared' ? 'Foto compartilhada.' : 'Foto baixada. Agora é só compartilhar!')
      } else {
        downloadBlob(blob)
        onMessage('Foto baixada em alta qualidade.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      onMessage('Não foi possível gerar sua foto. Tente novamente.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="export-placeholder" aria-label="Ações da foto">
      <button className="button button-share" type="button" disabled={disabled || Boolean(busy)} onClick={() => run('share')}>
        {busy === 'share' ? 'Preparando…' : 'Compartilhar'}
      </button>
      <button className="button button-download" type="button" disabled={disabled || Boolean(busy)} onClick={() => run('download')}>
        {busy === 'download' ? 'Gerando…' : 'Baixar minha foto'}
      </button>
    </div>
  )
}
