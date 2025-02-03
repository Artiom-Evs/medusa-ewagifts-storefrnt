const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

const imageSources = getImageSources()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      ...imageSources,
    ],
  },
}

module.exports = nextConfig

function getImageSources() {
  const urlsString = process.env.IMAGE_SOURCE_URLS

  if (!urlsString) return []

  const urls = urlsString.split(",").map((url) => url.trim())
  const regex = /^(https?):\/\/([^\/]+)/i

  return urls
    .map((url) => url.match(regex))
    .filter(Boolean)
    .map((match) => ({
      protocol: match[1],
      hostname: match[2],
    }))
}
