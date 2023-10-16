export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.well-known|manifest|assets|entrar|cadastrar|recuperar-senha|atualizar-senha|atualizar-email|api).*)',
  ],
}
