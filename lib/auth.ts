import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface SessionData {
  userId?: string
  email?: string
  isLoggedIn: boolean
}

const defaultSession: SessionData = {
  isLoggedIn: false,
}

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.IRON_SESSION_SECRET!,
    cookieName: 'habit-tracker-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  })

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn
  }

  return session
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session.isLoggedIn) {
    redirect('/login')
  }
  
  return session
}

export async function logout() {
  const session = await getSession()
  session.destroy()
  redirect('/login')
}
