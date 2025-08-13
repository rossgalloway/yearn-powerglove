import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { APYChart } from '@/components/charts/APYChart'

describe('APYChart', () => {
  it('renders an SVG', () => {
    const data = Array.from({ length: 10 }).map((_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      APY: Math.random() * 10,
      SMA15: null,
      SMA30: null,
    }))
    const { container } = render(
      <div style={{ width: 400, height: 300 }}>
        <APYChart chartData={data} timeframe="30d" />
      </div>
    )
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
