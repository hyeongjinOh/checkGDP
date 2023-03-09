const path = require("path");

module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  roots: ['./'],
  testEnvironment: 'jest-environment-jsdom',

  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "identity-obj-proxy",
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__test__/fileMock.ts',
    '^@/(.*)$': '<rootDir>/static/$1',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(.*\\.mjs)|date-fns)'],
  // setupFilesAfterEnv: ['jset'],
  /*
  module: {
    rules: [
      // style-loader, css-loader 구성
      // global.d.ts에 추가 선언
      { test: /\.css$/i, use: ['style-loader', 'css-loader'], },
    ],
  }
  */
};