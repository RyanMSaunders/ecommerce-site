import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    }
  },
  webpack(config: any) {
    config.resolve.modules.push('node_modules');
    config.resolve.alias['react'] = require.resolve('react');
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react/jsx-runtime': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    };
    return config;
  },
  
  rules: [
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-react',
                {
                  runtime: 'automatic', // Enabling the new JSX transform
                }
              ]
            ]
          }
      }
    },
  ],
}

export default nextConfig;


// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     serverActions: {
//       bodySizeLimit: '200mb',
//     },
//   },
//   webpack: (config) => {
//     config.resolve.modules.push('node_modules');
//     config.resolve.alias['react'] = require.resolve('react');
//     return config;
//   },
// };

// export default nextConfig;
