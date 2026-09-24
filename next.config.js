/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // Note: X-Content-Type-Options: nosniff is intentionally omitted —
    // with no middleware in the project, Next serves an empty JSON
    // _clientMiddlewareManifest, which nosniff turns into a console error.
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
