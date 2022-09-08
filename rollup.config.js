import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import nodePolyfills from "rollup-plugin-node-polyfills";
import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";

const commonPlugin = [
  resolve(), // so Rollup can find `ms`
  commonjs(),
  typescript(),
  nodePolyfills(),
];

export default [
  // browser-friendly UMD build
  {
    input: "src/index.js",
    output: {
      name: "report-websocket",
      file: pkg.browser,
      format: "esm",
      globals: {
        "reconnecting-websocket": "ReconnectingWebSocket",
        "@fingerprintjs/fingerprintjs": "Fingerprint",
        qs: "Qs",
      },
    },
    external: ["reconnecting-websocket", "qs", "@fingerprintjs/fingerprintjs"],
    plugins: [
      ...commonPlugin,
      getBabelOutputPlugin({
        presets: [
          [
            "@babel/preset-env",
            {
              modules: "umd",
            },
          ],
        ],
      }),
      terser(),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: "src/index.js",
    external: [
      "ms",
      "qs",
      "reconnecting-websocket",
      "@fingerprintjs/fingerprintjs",
    ],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [...commonPlugin, terser()],
  },
];
