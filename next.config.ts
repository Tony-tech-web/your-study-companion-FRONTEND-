const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https' as const, hostname: '**' }],
  },
};

export default nextConfig;
