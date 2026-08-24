import { useCallback, useRef, useState } from 'react'
import { CampaignFooter } from './components/CampaignFooter'
import { CampaignHeader } from './components/CampaignHeader'
import { EditorControls } from './components/EditorControls'
import { ExportActions } from './components/ExportActions'
import { FramePicker, type FrameOption } from './components/FramePicker'
import { PhotoInput } from './components/PhotoInput'
import { PhotoCanvas, type PhotoCanvasHandle } from './editor/PhotoCanvas'
import { loadImageFile, validateImageFile } from './editor/imageFile'

const frames: FrameOption[] = [
  { id: 'frame-01', name: 'Eu tô com Adalto', src: '/frames/frame-01.png' },
  { id: 'frame-02', name: 'Adalto e Edilson', src: '/frames/frame-02.png' },
  { id: 'frame-03', name: 'Fé e trabalho', src: '/frames/frame-03.svg' },
  { id: 'frame-04', name: 'Pernambuco', src: '/frames/frame-04.svg' },
]

export default function App() {
  const canvasRef = useRef<PhotoCanvasHandle>(null)
  const [selectedFrame, setSelectedFrame] = useState(frames[0])
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('')

  const report = useCallback((text: string) => setMessage(text), [])
  const setEditorReady = useCallback((value: boolean) => setReady(value), [])

  const handleFile = async (file: File) => {
    const validation = validateImageFile(file)
    if (validation) {
      report(validation)
      return
    }
    try {
      const image = await loadImageFile(file)
      setPhoto(image)
      setZoom(1)
      report('Foto carregada. Arraste para ajustar o enquadramento.')
    } catch {
      report('Não foi possível abrir esta foto. Escolha outra imagem.')
    }
  }

  return (
    <>
      <CampaignHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="party-pill">PP · Progressistas · Pernambuco</span>
            <h1 id="hero-title">Mostre que você<br /><em>está com Adalto</em></h1>
            <p>Crie sua foto de perfil oficial e faça parte dessa caminhada por Pernambuco.</p>
          </div>
          <div className="hero-number" aria-label="Número 11000"><span>Deputado Estadual</span>11000</div>
        </section>

        <section className="editor-section" id="editor" aria-labelledby="editor-title">
          <div className="editor-intro"><span>Faça em poucos segundos</span><h2 id="editor-title">Sua foto. Nossa caminhada.</h2><p>Tudo acontece aqui, sem enviar sua imagem para nenhum servidor.</p></div>
          <div className="editor-layout">
            <div className="preview-column">
              <PhotoCanvas ref={canvasRef} photo={photo} frameUrl={selectedFrame.src} zoom={zoom} onZoomChange={setZoom} onError={report} onReadyChange={setEditorReady} />
              <p className="gesture-hint">{photo ? 'Arraste para posicionar · Use dois dedos para ampliar' : 'Sua foto aparecerá dentro da moldura escolhida'}</p>
            </div>
            <div className="controls-column">
              <FramePicker frames={frames} selectedId={selectedFrame.id} onSelect={(frame) => { setSelectedFrame(frame); setMessage('') }} />
              <PhotoInput onFile={handleFile} hasPhoto={Boolean(photo)} />
              <EditorControls zoom={zoom} disabled={!ready} onZoomChange={setZoom} onNudge={(x, y) => canvasRef.current?.nudge(x, y)} />
              <div className="privacy"><span aria-hidden="true">◆</span><p><b>Sua foto é privada.</b><br />Ela é processada somente no seu dispositivo e não é armazenada.</p></div>
              <p className="status" role="status" aria-live="polite">{message}</p>
              <ExportActions disabled={!ready} exportImage={() => {
                if (!canvasRef.current) return Promise.reject(new Error('Editor indisponível'))
                return canvasRef.current.exportBlob()
              }} onMessage={report} />
            </div>
          </div>
        </section>
      </main>
      <CampaignFooter />
    </>
  )
}
