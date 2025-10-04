import { describe, it, expect } from 'vitest'

describe('Frontend Basic Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle strings', () => {
    expect('hello world').toContain('world')
  })

  it('should handle arrays', () => {
    const items = ['apple', 'banana', 'orange']
    expect(items).toHaveLength(3)
    expect(items).toContain('banana')
  })

  it('should handle objects', () => {
    const product = { name: 'Fresh Apple', price: 500 }
    expect(product).toHaveProperty('name')
    expect(product.price).toBe(500)
  })
})