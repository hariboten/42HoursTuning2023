/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,

  // eslint-disable-next-line require-await -- 型に合わせるため
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        has: [
          {
            type: "header",
            key: "Host",
            value: "localhost:3000",
          },
        ],
        destination: "http://localhost:80/api/:path*",
        basePath: false,
      },
    ];
  },
};

module.exports = nextConfig;
