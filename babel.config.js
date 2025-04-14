module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ['@babel/plugin-transform-template-literals', { loose: true }],
      ['@babel/plugin-transform-async-to-generator', { loose: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ['@babel/plugin-transform-export-namespace-from', { loose: true }],
      ['@babel/plugin-transform-object-rest-spread', { loose: true }],
    ],
  };
};
