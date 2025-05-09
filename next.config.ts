import type {NextConfig} from 'next';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

let assetPrefix = undefined;
let basePath = undefined;

if (isGithubActions) {
  // Extract repository name for basePath and assetPrefix
  // GITHUB_REPOSITORY is in format <owner>/<repository_name>
  // This setup assumes you are deploying to a project page (e.g., username.github.io/repo-name)
  // If deploying to a user/org page (username.github.io), basePath and assetPrefix might not be needed or should be '/'
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (repo) {
    assetPrefix = `/${repo}/`;
    basePath = `/${repo}`;
    console.log(`GitHub Pages deployment detected. Using: basePath='${basePath}', assetPrefix='${assetPrefix}'`);
  } else {
    console.warn("GitHub Pages deployment: GITHUB_REPOSITORY env var not found or in unexpected format. basePath and assetPrefix will not be set automatically for subpath deployment. Site might not work correctly if deployed to a subpath like username.github.io/repo-name.");
  }
}


const nextConfig: NextConfig = {
  output: 'export', // Enables static HTML export
  basePath: basePath, // Sets the base path for routing, crucial for GitHub Pages project pages
  assetPrefix: assetPrefix, // Sets the asset prefix for loading assets like JS/CSS, crucial for GitHub Pages
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export to work with next/image on platforms like GitHub Pages without a custom image loader
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
