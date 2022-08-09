import commonJs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import type { RollupOptions } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import postcss from 'rollup-plugin-postcss'
import ts from 'rollup-plugin-typescript2'
import packageJson from './package.json'

const config: RollupOptions = {
    input: './src/main.ts',
    plugins: [
        nodeResolve(),
        ts(),
        vue({
            isProduction: true
        }),
        esbuild({
            sourceMap: true,
            loaders: {
                '.vue': 'ts'
            }
        }),
        commonJs(),
        postcss({
            plugins: [autoprefixer, cssnano]
        })
    ],
    output: [
        {
            format: 'umd',
            name: 'flipList',
            file: packageJson.main,
            exports: 'named',
            globals: {
                vue: 'Vue'
            }
        },
        {
            format: 'esm',
            file: packageJson.module
        }
    ],
    external: ['vue']
}

export default config
