const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Ajv = require('ajv');

// config/*.json のJSON スキーマ定義
// ajv でバリデートするとき用
const configSchema = {
  "properties": {
    "defaultLayout": {
      "type": "string",
    },
    "lsConfURL": {
      "type": "string",
    },
    "thetaZoomMaxRange": {
      "type": "number", "minimum": 1
    },
    "player": {
      "type": "object",
      "properties": {
        "isHiddenVideoControlBar": {
          "type": "boolean",
        }
      }
    },
    "subView": {
      "type": "object",
      "properties": {
        "isHiddenDrawingButton": {
          "type": "boolean"
        },
        "drawingInterval": {
          "type": "number"
        },
        "drawingColor": {
          "type": "string"
        },
        "drawingOption": {
          "type": "object",
          "properties": {
            "size": {
              "type": "number",
            },
          }
        },
        "normal": {
          "type": "object",
          "properties": {
            "enableZoom": {
              "type": "boolean",
            },
            "isHiddenFramerate": {
              "type": "boolean",
            },
          }
        },
        "menu": {
          "type": "object",
          "properties": {
            "isHidden": {
              "type": "boolean",
            },
            "isHiddenSharePoVButton": {
              "type": "boolean",
            },
            "customItems": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "type": {
                    "type": "string",
                  },
                  "label": {
                    "type": "string",
                  },
                  "targetSubView": {
                    "type": "object",
                    "properties": {
                      "type": {
                        "type": "string",
                        "pattern": "VIDEO_AUDIO|SCREEN_SHARE|VIDEO_FILE"
                      },
                      "isTheta": {
                        "type": "boolean"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "theme": {
      "type": "object",
      "properties": {
        "primary": {
          "type": "string",
        },
        "background": {
          "type": "string",
        },
        "surface": {
          "type": "string",
        },
        "onPrimary": {
          "type": "string",
        },
        "primaryTextColor": {
          "type": "string",
        },
        "secondaryTextColor": {
          "type": "string",
        },
        "disabledTextColor": {
          "type": "string",
        },
        "components": {
          "type": "object",
          "properties": {
            "participantsVideoContainer": {
              "type": "object",
              "properties": {
                "background": {
                  "type": "string",
                },
                "subViewSwitchBackgroundColor": {
                  "type": "string",
                },
                "subViewSwitchIconColor": {
                  "type": "string",
                },
              }
            },
            "toolbar": {
              "type": "object",
              "properties": {
                "background": {
                  "type": "string",
                },
                "iconColor": {
                  "type": "string",
                },
              }
            },
            "video": {
              "type": "object",
              "properties": {
                "background": {
                  "type": "string",
                },
                "textColor": {
                  "type": "string",
                },
                "textBackgroundColor": {
                  "type": "string",
                },
                "iconColor": {
                  "type": "string",
                },
                "menuBackgroundColor": {
                  "type": "string",
                },
                "menuTextColor": {
                  "type": "string",
                },
                "highlightBorderColor": {
                  "type": "string",
                },
                "highlightShadowColor": {
                  "type": "string",
                },
              }
            },
          }
        }
      }
    }
  }
}

function validateConfig(configPath) {
  const config = require(configPath);
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(configSchema)
  const valid = validate(config);
  if (!valid) {
    const errorMessage = `[invalid config] ${ajv.errorsText(validate.errors)} at ${configPath.toString()}`;
    throw new Error(errorMessage);
  }
  return config;
}

module.exports = (env, argv) => {
  const mode = process.env.NODE_ENV || 'development';
  const isProduction = mode === 'production';
  const watch = !isProduction && process.env.WATCH === 'true';
  // production とそれ以外で読み込む JSON を変える
  const configFileName = isProduction ? 'production.json' : 'local.json';
  const configPath = path.resolve(__dirname, `config/${configFileName}`);
  const { lsConfURL, defaultLayout, player, thetaZoomMaxRange, theme, subView } = validateConfig(configPath);
  return {
    mode: mode,
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
      filename: 'js/[name].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },
    devtool: isProduction ? false : 'source-map',
    devServer: {
      compress: true,
      port: 3000,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          pathRewrite: { '^/api': '' },
        },
      },
      headers: {
        // メモリ使用量の取得で performance.measureUserAgentSpecificMemory() を使用するため Cross-Origin 系のヘッダを設定
        // cf: https://developer.mozilla.org/ja/docs/Web/API/Performance/measureUserAgentSpecificMemory
        // Cross-Origin 系のヘッダが設定されていない LSConf を参照する場合は以下の Cross-Origin 系のヘッダを削除（コメントアウト）する
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    plugins: [
      // XXX(kdxu): 一旦 TS のコンパイルを通すため設定値は process.env.XXX として渡している。他によい方法があればそちらを採用する
      new webpack.DefinePlugin({
        'process.env.DEBUG': !isProduction,
        'config.DEFAULT_LAYOUT': JSON.stringify(defaultLayout),
        'config.LS_CONF_URL': JSON.stringify(lsConfURL),
        'config.THETA_ZOOM_MAX_RANGE': JSON.stringify(thetaZoomMaxRange),
        'config.PLAYER': JSON.stringify(player),
        'config.SUBVIEW_CONFIG': JSON.stringify(subView),
        'config.THEME_CONFIG': JSON.stringify(theme),
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
      }),
      new htmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
      }),
    ],
    optimization: {
      splitChunks: {
        name: 'vendor',
        chunks: 'initial',
      },
    },
    performance: {
      maxEntrypointSize: 1000000,
      maxAssetSize: 1000000,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: [
            // material-ui は source-map を提供してくれていないっぽいので除外
            path.resolve(__dirname, "node_modules/@material/"),
            path.resolve(__dirname, "node_modules/@rmwc/"),
          ],
        },
        {
          test: /\.css$/,
          sideEffects: true,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg|webp|svg)$/i,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            context: 'src',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          loader: 'file-loader',
          options: {
            limit: 8192,
            name: '[path][name].[ext]',
            context: 'src',
          },
        },
      ],
    },
    watch,
  };
};
