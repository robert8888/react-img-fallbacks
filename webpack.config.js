const path = require("path")

module.exports = {
    mode: 'production',
    entry: './src/ImageFallback.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'react-img-fallback.js',
        library: 'react-img-fallback',
        libraryTarget: 'umd',
        libraryExport: 'default',
        globalObject: 'this',
    },

    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": ["@babel/preset-react", "@babel/preset-env"],
                        //plugins: ["@babel/plugin-transform-react-jsx"]
                    }
                }
            }
        ]
    },
    externals: {
        react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react',
            umd: 'react',
        },
        'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd: 'react-dom',
            umd: 'react-dom',
        },
        'prop-type': {
            root: 'PropType',
            commonjs2: 'prop-type',
            commonjs: 'prop-type',
            amd: 'prop-type',
            umd: 'prop-type',
        },
    },
};
