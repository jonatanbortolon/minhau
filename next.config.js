/* eslint-disable @typescript-eslint/no-var-requires */
const { withSentryConfig } = require('@sentry/nextjs')
const withPWA = require('@ducanh2912/next-pwa').default

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
      bcrypt: 'bcrypt',
    })

    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader',
    })

    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

const pwaConfig = {
  dest: 'public',
  sw: 'sw.js',
  workboxOptions: {
    disableDevLogs: true,
  },
}

const sentryWebpackPluginConfig = {
  // Additional config options for the Sentry webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, configFile, stripPrefix, urlPrefix, include, ignore

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true, // Suppresses all logs

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

module.exports = withSentryConfig(
  withPWA(pwaConfig)(nextConfig),
  sentryWebpackPluginConfig,
)
