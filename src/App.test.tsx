import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./editor/imageFile', () => ({
  validateImageFile: (file: File) => file.type === 'image/png' ? null : 'Escolha uma imagem JPG, PNG ou WEBP.',
  loadImageFile: vi.fn().mockResolvedValue({ naturalWidth: 1080, naturalHeight: 1080 }),
}))

describe('App', () => {
  it('shows the complete campaign editor on one page', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /mostre que você\s*está com adalto/i })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
    expect(screen.getByRole('button', { name: /escolher foto/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tirar selfie/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /zoom/i })).toBeDisabled()
    expect(screen.getByText(/processada somente no seu dispositivo/i)).toBeInTheDocument()
  })

  it('reports an invalid file without changing the selected frame', () => {
    render(<App />)
    const selected = screen.getAllByRole('radio')[0]
    const input = screen.getByTestId('gallery-input')

    fireEvent.change(input, {
      target: { files: [new File(['pdf'], 'document.pdf', { type: 'application/pdf' })] },
    })

    expect(screen.getByText('Escolha uma imagem JPG, PNG ou WEBP.')).toBeInTheDocument()
    expect(selected).toBeChecked()
  })
})
