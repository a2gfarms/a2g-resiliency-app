/** @type {import('next').NextConfig} */
const nextConfig = {
  // Phase 1 is fully static (no server routes yet) — static export deploys
  // on Netlify with zero adapters. Phase 3 (coach API) switches this to the
  // Netlify Next.js runtime.
  output: 'export',
  images: { unoptimized: true }
};
export default nextConfig;
