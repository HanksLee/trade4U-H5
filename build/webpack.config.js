const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const config = require("./config");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const fs = require("fs"),
  { lstatSync, readdirSync } = require("fs");
const path = require("path");
const { resolve } = require("./utils");

const isDirectory = (source) => lstatSync(source).isDirectory();
// 获取 src 下的所有目录
const getDirectories = (source) =>
  readdirSync(source)
    .map((name) => path.join(source, name))
    .filter(isDirectory)
    .map((file) => file.slice(file.lastIndexOf("/") + 1));
// 将 src 下的目录拼接成 alias
const makeAliasOfSrc = getDirectories(resolve("src"))
  .map((key) => {
    return { [key]: resolve(`src/${key}`) };
  })
  .reduce((acc, cur) => (acc = { ...acc, ...cur }));

function resolvePath(dir) {
  return path.join(__dirname, "..", dir);
}

const env = process.env.NODE_ENV || "development";
const target = process.env.TARGET || "web";
const s = JSON.stringify;
const setLoaderSourceMap = (loader, options, isProd) => {
  return { loader, options: { ...options, sourceMap: isProd ? false : true } };
};

module.exports = {
  mode: env,
  entry: {
    app: "./src/js/app.js",
  },
  output: {
    path: resolvePath("www"),
    filename: env === "production" ? 'assets/js/build.[chunkhash:5].js' : 'build.js',
    chunkFilename: env === "production" ? 'assets/js/[name].[chunkhash:5].js' : '[name].js',
    publicPath: "",
    hotUpdateChunkFilename: "hot/hot-update.js",
    hotUpdateMainFilename: "hot/hot-update.json",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
    alias: {
      ...makeAliasOfSrc,
      "@": resolvePath("src"),
    },
  },
  devtool: env === "production" ? "source-map" : "source-map",
  devServer: {
    hot: true,
    open: true,
    compress: true,
    contentBase: "/www/",
    disableHostCheck: true,
    historyApiFallback: true,
    watchOptions: {
      poll: 1000,
    },
    proxy: {
      "/api/moon": {
        target: "http://api.cangshu360.com",
        pathRewrite: { "^/api/moon": "" },
        secure: false,
        changeOrigin: true,
      },
    },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(mjs|js|jsx)$/,
        use: "babel-loader",
        include: [
          resolvePath("src"),
          resolvePath("node_modules/framework7"),

          resolvePath("node_modules/framework7-react"),

          resolvePath("node_modules/template7"),
          resolvePath("node_modules/dom7"),
          resolvePath("node_modules/ssr-window"),
        ],
      },

      {
        test: /\.css$/,
        use: [
          env === "development"
            ? "style-loader"
            : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: "../",
                },
              },
          "css-loader",
          "postcss-loader",
        ],
      },
      {
        test: /\.styl(us)?$/,
        use: [
          env === "development"
            ? "style-loader"
            : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: "../",
                },
              },
          "css-loader",
          "postcss-loader",
          "stylus-loader",
        ],
      },
      {
        test: /\.less$/,
        use: [
          env === "development"
            ? "style-loader"
            : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: "../",
                },
              },
          "css-loader",
          "postcss-loader",
          "less-loader",
        ],
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          env === "development"
            ? "style-loader"
            : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: "../",
                },
              },
          "css-loader",
          "postcss-loader",
          // 'sass-loader',
          // setLoaderSourceMap(
          //   "sass-loader",
          //   {
          //     data: `
          //     $isProd: "${env !== 'development'}"
          //     $assetsPath: "${config.assetsPath}";`
          //   },
          //   env !== 'development'
          // ),
          {
            loader: "sass-loader",
            options: {
              prependData: `
              $assetsPath: "${config.assetsPath}";`,
            },
          },
          setLoaderSourceMap("sass-resources-loader", {
            resources: [
              resolve("src/css/vars.scss"),
              resolve("src/css/mixins.scss"),
              resolve("src/css/func.scss"),
            ],
          }),
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "images/[name].[ext]",
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac|m4a)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "media/[name].[ext]",
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "fonts/[name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(env),
      "process.env.TARGET": JSON.stringify(target),
      "process.env": {
        designWidth: 375,
        assetsPath: s(config.assetsPath),
        MODE: s(process.env.MODE),
      },
    }),

    ...(env === "production"
      ? [
          new OptimizeCSSPlugin({
            cssProcessorOptions: {
              safe: true,
              map: { inline: false },
            },
          }),
          new webpack.optimize.ModuleConcatenationPlugin(),
        ]
      : [
          // Development only plugins
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NamedModulesPlugin(),
        ]),
    new HtmlWebpackPlugin({
      filename: "./index.html",
      template: "./src/index.html",
      inject: true,
      minify:
        env === "production"
          ? {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              useShortDoctype: true,
            }
          : false,
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new CopyWebpackPlugin([
      {
        from: resolvePath("src/static"),
        to: resolvePath("www/static"),
      },
      {
        from: resolvePath("src/assets"),
        to: resolvePath("www/assets"),
      },
    ]),
  ],
};
