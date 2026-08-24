type Props = { zoom: number; disabled: boolean; onZoomChange: (value: number) => void; onNudge: (x: number, y: number) => void }

export function EditorControls({ zoom, disabled, onZoomChange, onNudge }: Props) {
  return (
    <div className="adjustments">
      <div className="zoom-control">
        <div><label htmlFor="zoom">Zoom</label><output>{Math.round(zoom * 100)}%</output></div>
        <div className="slider-row"><span>−</span><input id="zoom" aria-label="Zoom" type="range" min="1" max="3" step="0.01" value={zoom} disabled={disabled} onChange={(event) => onZoomChange(Number(event.target.value))} /><span>+</span></div>
      </div>
      <div className="position-control">
        <span>Posição</span>
        <div className="direction-pad">
          <button type="button" aria-label="Mover foto para cima" disabled={disabled} onClick={() => onNudge(0, -40)}>↑</button>
          <button type="button" aria-label="Mover foto para a esquerda" disabled={disabled} onClick={() => onNudge(-40, 0)}>←</button>
          <i aria-hidden="true">●</i>
          <button type="button" aria-label="Mover foto para a direita" disabled={disabled} onClick={() => onNudge(40, 0)}>→</button>
          <button type="button" aria-label="Mover foto para baixo" disabled={disabled} onClick={() => onNudge(0, 40)}>↓</button>
        </div>
      </div>
    </div>
  )
}
