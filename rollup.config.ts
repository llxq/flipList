import commonJs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import vue from '@vitejs/plugin-vue'
import type { RollupOptions } from 'rollup'
import ts from 'rollup-plugin-typescript2'
import packageJson from './package.json'

const config: RollupOptions = {
    input: './src/main.ts',
    plugins: [
        ts(),
        vue({isProduction: true}),
        nodeResolve(),
        commonJs()
    ],
    output: [
        {
            format: 'umd',
            name: 'flipList',
            file: packageJson.main,
            exports: 'named'
        },
        {
            format: 'esm',
            file: packageJson.module
        }
    ]
}

export default config
