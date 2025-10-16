import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ChartComponent from './ChartComponent'

describe('ChartComponent', () => {
  it('renders without crashing', () => {
    render(<ChartComponent data={[{ name: 'A', value: 1 }]} />)
    expect(true).toBe(true)
  })
})
