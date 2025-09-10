import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { APYChart } from '@/components/charts/APYChart'

describe('APYChart', () => {
  it('renders without crashing', () => {
    const data = Array.from({ length: 10 }).map((_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      APY: Math.random() * 10,
      SMA15: null,
      SMA30: null,
      APR: Math.random() * 10,
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
    
    const { container, getByLabelText } = render(
      <div style={{ width: '400px', height: '300px' }}>
        <APYChart chartData={data} timeframe="30d" />
      </div>
    )
    // APR line should be hidden by default
    expect(
      container.querySelector('path[stroke="var(--color-apr)"]')
    ).toBeNull()

    const checkbox = getByLabelText(/show raw apr values/i)
    fireEvent.click(checkbox)
    expect(
      container.querySelector('path[stroke="var(--color-apr)"]')
    ).toBeTruthy()
  })
})
