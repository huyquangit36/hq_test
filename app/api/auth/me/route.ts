import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { withAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  return withAuth(request, async (_, user) => {
    try {
      // Fetch fresh user data from database
      const users = await sql`
        SELECT id, email, first_name, last_name, role, created_at, updated_at
        FROM users
        WHERE id = ${user.userId}
      `

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const userData = users[0]

      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at
        }
      })
    } catch (error) {
      console.error('Get user error:', error)
      return NextResponse.json(
        { error: 'An error occurred while fetching user data' },
        { status: 500 }
      )
    }
  })
}
