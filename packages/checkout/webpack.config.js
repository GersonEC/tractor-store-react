import HtmlWebpackPlugin from 'html-webpack-plugin';
import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";

export default (
  env,
  argv
) => {
  const { host } = env;
  const { mode } = argv;

  const webpackConfig = {
    mode,

    entry: "./src/index",

    output: {
      uniqueName: 'checkout',
      publicPath: 'auto',
    },

    devServer: {
      port: 3002,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },

    resolve: {
      extensions: ['', '.ts', '.tsx', '.css', '...'],
    },

    module: {
      rules: [
        {
          test: /\.(?:tsx?|jsx?)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: "defaults" }],
                "@babel/preset-react",
                "@babel/preset-typescript",
              ],
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                url: true,
                import: true,
              }
            },
          ],
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: "checkout",
        exposes: {
          './AddToCart': './src/AddToCart.tsx',
          './MiniCart': './src/MiniCart.tsx',
          './App': './src/App.tsx',
        },
        remotes: {
          'explore': mode === "production" ?
            `explore@${host}/explore/mf-manifest.json` : "explore@http://localhost:3001/mf-manifest.json",
          'app': mode === "production" ?
            `app@${host}/mf-manifest.json` : 'app@http://localhost:3000/mf-manifest.json',
        },
        shared: {
          react: {
            singleton: true,
          },
          'react-dom': {
            singleton: true
          },
          'react-router-dom': {
            singleton: true
          }
        }
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
  };

  return webpackConfig;
};
