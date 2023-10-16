import { authOptions } from '@/authOptions'
import nextAuth from 'next-auth'

export const dynamic = 'force-dynamic'

const handler = nextAuth(authOptions)

export { handler as GET, handler as POST }
