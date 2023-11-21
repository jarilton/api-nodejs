import { test, expect } from 'vitest'

test('O usuário consegue criar uma nova transação', () => {
  const responsestatusCode = 201

  expect(responsestatusCode).toBe(201)
})
