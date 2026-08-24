export type FrameOption = { id: string; name: string; src: string }

type Props = {
  frames: FrameOption[]
  selectedId: string
  onSelect: (frame: FrameOption) => void
}

export function FramePicker({ frames, selectedId, onSelect }: Props) {
  return (
    <fieldset className="frame-picker">
      <legend>Escolha sua moldura</legend>
      <p>Toque para ver no editor.</p>
      <div className="frame-list">
        {frames.map((frame, index) => (
          <label className="frame-option" key={frame.id}>
            <input
              type="radio"
              name="frame"
              value={frame.id}
              checked={selectedId === frame.id}
              onChange={() => onSelect(frame)}
            />
            <span className="frame-thumbnail">
              <img src={frame.src} alt="" />
              <b>{String(index + 1).padStart(2, '0')}</b>
            </span>
            <span>{frame.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
