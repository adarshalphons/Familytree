import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const usersPath = path.join(process.cwd(), 'data', 'users.json')

export async function POST(request) {
  const { username, password } = await request.json()
  const users = JSON.parse(fs.readFileSync(usersPath))

  const user = users.find(
    (u) => u.username === username && u.password === password
  )

  if (!user) {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    username: user.username,
    role: user.role,
    name: user.name
  })
}