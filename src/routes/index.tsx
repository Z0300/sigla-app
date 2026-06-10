import { Roles } from '#/constants/permissions'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  ssr: 'data-only',
  beforeLoad: async ({ context }) => {
    const { auth } = context

    if (!auth?.accessToken) {
      throw redirect({ to: '/login', statusCode: 302 })
    }

    throw redirect({
      to: auth.roles.includes(Roles.ADMIN) ? '/dashboard' : '/events',
      statusCode: 302,
    })
  },
  component: () => null
})

