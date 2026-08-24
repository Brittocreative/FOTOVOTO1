import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EditorControls } from './EditorControls'

describe('EditorControls', () => {
  it('offers four precise directions for non-square photos', () => {
    const onNudge = vi.fn()
    render(<EditorControls zoom={1} disabled={false} onZoomChange={() => undefined} onNudge={onNudge} />)

    fireEvent.click(screen.getByRole('button', { name: 'Mover foto para cima' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mover foto para a esquerda' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mover foto para a direita' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mover foto para baixo' }))

    expect(onNudge.mock.calls).toEqual([[0, -40], [-40, 0], [40, 0], [0, 40]])
  })
})
