/* config-overrides.js */
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = function override(config, env) {
  config.module.rules.push({
    resolve:{
      alias: {
        ...config.resolve.alias,
        'mapbox-gl': 'maplibre-gl'
      }
    }
  })

  config.plugins = [
    ...config.plugins,
    new MonacoWebpackPlugin()
  ]

  return config
}
