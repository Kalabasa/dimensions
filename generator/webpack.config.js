const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
	mode: process.env.NODE_ENV || 'development',
	entry: './src/main',
	resolve: {
		modules: [path.resolve(__dirname, 'src'), 'node_modules'],
		extensions: ['.js', '.vue', '.json']
	},
	output: {
		path: path.resolve(__dirname, 'build'),
		publicPath: 'build',
		filename: 'main.js'
	},
	module: {
		rules: [
			{
				test: /\.png$/,
				use: 'file-loader'
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.js$/,
				loader: 'babel-loader'
			},
			{
				test: /\.css$/,
				use: ['vue-style-loader', 'css-loader']
			}
		]
	},
	plugins: [new VueLoaderPlugin()]
};
