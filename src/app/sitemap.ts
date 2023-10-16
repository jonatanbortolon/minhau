import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://minhau.com.br',
      lastModified: new Date(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      changeFrequency: 'never',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      priority: 1,
    },
    {
      url: 'https://minhau.com.br/entrar',
      lastModified: new Date(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      changeFrequency: 'never',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      priority: 0.8,
    },
    {
      url: 'https://minhau.com.br/cadastrar',
      lastModified: new Date(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      changeFrequency: 'never',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      priority: 0.8,
    },
  ]
}
