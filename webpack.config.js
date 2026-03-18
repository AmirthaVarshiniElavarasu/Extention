const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? 'source-map' : 'eval-source-map',

        entry: {
            popup: './src/popup/popup.js',
            options: './src/options/options.js',
            background: './src/background/background.js'
        },

        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'js/[name].js',
            clean: true
        },

        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    targets: {
                                        chrome: '88'
                                    }
                                }]
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[name][ext]'
                    }
                }
            ]
        },

        plugins: [
            // Generate popup HTML
            new HtmlWebpackPlugin({
                template: './src/popup/popup.html',
                filename: 'popup.html',
                chunks: ['popup'],
                minify: isProduction ? {
                    removeComments: true,
                    collapseWhitespace: true
                } : false
            }),

            // Generate options HTML
            new HtmlWebpackPlugin({
                template: './src/options/options.html',
                filename: 'options.html',
                chunks: ['options'],
                minify: isProduction ? {
                    removeComments: true,
                    collapseWhitespace: true
                } : false
            }),

            // Copy manifest and assets
            new CopyPlugin({
                patterns: [
                    {
                        from: 'manifest.json',
                        to: 'manifest.json'
                    },
                    {
                        from: 'images',
                        to: 'images',
                        noErrorOnMissing: true
                    },
                    {
                        from: 'src/popup/popup.css',
                        to: 'css/popup.css'
                    },
                    {
                        from: 'src/options/options.css',
                        to: 'css/options.css'
                    }
                ]
            })
        ],

        optimization: isProduction ? {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true
                        },
                        format: {
                            comments: false
                        }
                    },
                    extractComments: false
                })
            ],
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: 10
                    },
                    common: {
                        minChunks: 2,
                        priority: 5,
                        reuseExistingChunk: true
                    }
                }
            }
        } : {
            minimize: false
        },

        resolve: {
            extensions: ['.js', '.json'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@services': path.resolve(__dirname, 'src/services'),
                '@utils': path.resolve(__dirname, 'src/utils')
            }
        },

        performance: {
            maxEntrypointSize: 512000,
            maxAssetSize: 512000
        }
    };
};
