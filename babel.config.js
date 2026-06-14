/**
 * Replaces every `import.meta` expression with an empty object literal.
 *
 * Some dependencies (e.g. zustand's devtools middleware, pulled in via
 * `zustand/middleware`) ship ESM that reads `import.meta.env.MODE`. Metro
 * loads the web bundle as a classic <script>, where the `import.meta` token is
 * a hard SyntaxError ("Cannot use 'import.meta' outside a module"). Turning it
 * into `({})` keeps the optional-chaining call sites safe (`({}).env` is just
 * undefined) without pulling in Node-only polyfills.
 */
function replaceImportMeta() {
  return {
    name: 'replace-import-meta',
    visitor: {
      MetaProperty(path) {
        const { node } = path;
        if (node.meta && node.meta.name === 'import' && node.property.name === 'meta') {
          path.replaceWithSourceString('({})');
        }
      },
    },
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      replaceImportMeta,
      // Must remain last.
      'react-native-reanimated/plugin',
    ],
  };
};
