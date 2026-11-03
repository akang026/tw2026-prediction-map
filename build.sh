#!/bin/sh
# 修改 src/ 後執行：打包成 dist/app.js（需要 Node.js）
npx esbuild src/app.js --bundle --minify --format=iife --loader:.svg=text --outfile=dist/app.js
