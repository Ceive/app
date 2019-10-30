		
const path = require("path");
const dist = path.resolve(__dirname, "web/build");
const src =  path.resolve(__dirname, "webSrc");
const distJs = "bundle.js";
const webDir = "/web";
		
module.exports = {
	context: src,
	entry: [
		path.resolve(src, "index.js")
	],
	output: {
		path: dist,
		filename: distJs,
		publicPath: webDir,
	},
	devtool: 'source-map',
	module: {

		rules: [
			{
				test: /\.css$/,
				use: [ 'style-loader','css-loader' ]
			},{
				test: /\.mp3$/,
				loader: 'url-loader?limit=1000000' // Url imports
			},{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},{
				test: /\.(png|jpg|)$/,
				loader: 'url-loader?limit=200000' // Url imports
			}
		]
	}
};