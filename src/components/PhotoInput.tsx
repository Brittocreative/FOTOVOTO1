import { useRef, type ChangeEvent } from 'react'

type Props = { onFile: (file: File) => void; hasPhoto: boolean }

export function PhotoInput({ onFile, hasPhoto }: Props) {
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onFile(file)
    event.target.value = ''
  }

  return (
    <div className="photo-actions">
      <input data-testid="gallery-input" ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} hidden />
      <input ref={cameraRef} type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={choose} hidden />
      <button className="button button-primary" type="button" onClick={() => galleryRef.current?.click()}>
        <span aria-hidden="true">↗</span> {hasPhoto ? 'Trocar foto' : 'Escolher foto'}
      </button>
      <button className="button button-secondary" type="button" onClick={() => cameraRef.current?.click()}>
        <span aria-hidden="true">●</span> Tirar selfie
      </button>
    </div>
  )
}
