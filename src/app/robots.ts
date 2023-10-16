import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/entrar', '/cadastrar'],
      disallow: ['/*/pets', '/*/conversas', '/configuracoes', '/perfil'],
    },
    sitemap: 'https://minhau.com.br/sitemap.xml',
  }
}
