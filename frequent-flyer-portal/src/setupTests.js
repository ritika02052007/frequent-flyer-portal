import '@testing-library/jest-dom/vitest'
import * as matchers from 'vitest-axe/matchers'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

expect.extend(matchers)

afterEach(() => {
  cleanup()
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }
  } catch {
    // Ignore
  }
})
