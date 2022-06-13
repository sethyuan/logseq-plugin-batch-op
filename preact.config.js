import { resolve } from "path"

export default (config, env, helpers, options) => {
  config.output.publicPath = ""
  config.resolve.alias["@"] = resolve("src")
  const sizePlugin = helpers.getPluginsByName(config, "SizePlugin")[0]
  if (sizePlugin) {
    config.plugins.splice(sizePlugin.index, 1)
  }
  config.devServer.host = "localhost"
}
