import babel from "rollup-plugin-babel";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import externals from "rollup-plugin-node-externals";
import css from "rollup-plugin-css-porter";
import html from "@rollup/plugin-html";

import pkg from "./package.json";
import fs from "fs";
import ejs from "ejs";
import { minify } from "html-minifier-terser";

const isProduction = process.env.NODE_ENV === "production";

export default {
  input: "src/App.js",
  output: {
    file: "dist/App.js",
    format: "cjs",
    sourcemap: !isProduction && "inline",
  },
  external: ["nw.gui"],
  plugins: [
    babel(),
    replace({ "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) }),
    externals({ deps: true }), // skip bundling dependencies
    isProduction && terser(), // minify production builds

    css({ raw: false }),
    html({
      title: pkg.window.title,
      template(data) {
        const str = fs.readFileSync("src/index.ejs", "utf8");
        const result = ejs.render(str, data);

        const minifyOptions = {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
        };
        return isProduction ? minify(result, minifyOptions) : result;
      },
    }),
  ],
};
