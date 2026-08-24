import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => cleanup())

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
  clearRect: vi.fn(),
  drawImage: vi.fn(),
} as unknown as CanvasRenderingContext2D)
