import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { APYChart } from '@/components/charts/APYChart'

describe('APYChart', () => {
  it('renders without crashing', () => {
    const data = Array.from({ length: 10 }).map((_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      APY: Math.random() * 10,
      SMA15: null,
      SMA30: null,
      APR: null,
    }))
    
    // Mock getBoundingClientRect for Recharts ResponsiveContainer
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 400,
      height: 300,
      top: 0,
      left: 0,
      bottom: 300,
      right: 400,
      x: 0,
      y: 0,
      toJSON: () => {},
    }))
    
    const { container } = render(
      <div style={{ width: '400px', height: '300px' }}>
        <APYChart chartData={data} timeframe="30d" />
      </div>
    )
    
    // Just check that the component renders without throwing
    expect(container.firstChild).toBeTruthy()
  })
})
