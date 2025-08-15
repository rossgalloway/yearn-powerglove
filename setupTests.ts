import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver for chart components (Recharts dependency)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
