const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve .mjs and .cjs files (needed for pocketbase)
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Force pocketbase to use its CJS build which is compatible with React Native
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'pocketbase') {
    return {
      filePath: require.resolve('pocketbase/cjs'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
