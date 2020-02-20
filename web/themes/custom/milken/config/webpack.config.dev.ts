/* eslint-disable @typescript-eslint/no-var-requires */
const Stream = require('stream');
const path = require('path');
const webpack = require("webpack");
const PluginError = require("plugin-error");
const Logger = require('fancy-log');




module.exports = () => {
  var configurator = (name, file) => {
    console.log(`Configuring: ${file}`)
    var babelLoader = {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        presets: [
          '@babel/preset-env'
        ],
        plugins: [
          '@babel/plugin-proposal-object-rest-spread'
        ]
      }
    };

    var toReturn = {
      entry: {},
      mode: "development",
      // Enable sourcemaps for debugging webpack's output.
      devtool: "source-map",
      cache: true,
      output: {
        filename: 'js/[name].entry.js',
        path: path.dirname(file)
      },
      resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json", ".jsx"],
        plugins: [

        ],
        alias: {
          components: path.resolve('./src/components')
        }
      },

      module: {
        rules: [
          // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
          {
            test: /\.ts(x?)$/,
            exclude: /node_modules/,
            use: [
              babelLoader
            ]
          },

          // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
          {enforce: "pre", test: /\.js$/, loader: "source-map-loader"},
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
          }
        ]
      },
      // When importing a module whose path matches one of the following, just
      // assume a corresponding global variable exists and use that instead.
      // This is important because it allows us to avoid bundling all of our
      // dependencies, which allows browsers to cache those libraries between builds.
      externals: {
        "react": "React",
        "react-dom": "ReactDOM"
      },
      plugins: [
      ],
      stats: {
        warnings: true,
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
      }
    }
    toReturn.entry[name] = file;
    return toReturn;
  };

  var stream = new Stream.Transform({ objectMode: true });

  function parsePath(incoming) {
    return {
      full: path.resolve(incoming),
      dirname: path.dirname(incoming),
      basename: path.basename(incoming, path.extname(incoming)),
      libraryName: path.basename(incoming).replace('.entry.' + path.extname(incoming), '')
    };
  }
  stream._transform = function(originalFile, unused, callback) {
    var file = originalFile.clone({ contents: false });
    console.log(file);
    var parsedPath = parsePath(file.path);
    console.log(`tranforming ${parsedPath.libraryName}!`);
    console.log(parsedPath);
    var webPackConfig = configurator(parsedPath.libraryName, parsedPath.full);
    console.log(webPackConfig);
    webpack(webPackConfig, (err, stats) => {
      if (err) {
        throw new PluginError('webpack:build', err);
      }
      Logger.info('[webpack:build]', stats.toString({
        colors: true
      }));
    });
    callback(null, file);
  };
  return stream;
}

