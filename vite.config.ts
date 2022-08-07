// https://vitejs.dev/config/
// 中文文档：https://www.pipipi.net/vite/
import { defineConfig, UserConfig, loadEnv } from 'vite'
import { alias } from './scripts/config'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import svgPlugin from './src/plugins/svgPlugin'

export default defineConfig((env) => {
    // env 环境变量
    const viteEnv = loadEnv(env.mode, `.env.${env.mode}`)

    const config: UserConfig = {
        base: '/',
        build: {
            assetsDir: 'static',
            // TODO 后续记得修改
            sourcemap: false,
            // @see https://vitejs.cn/config/#build-brotlisize
            brotliSize: false
        },
        // 为window增加全局变量
        define: {
            'redcatApp': {}
        },
        plugins: [
            vue(),
            monacoEditorPlugin({
                // 默认值：['editorWorkerService', 'css', 'html', 'json', 'typescript']
                languageWorkers: ['editorWorkerService', 'css', 'typescript']
            }),
            svgPlugin([
                './src/assets/svg/',
                './src/module/page/views/assets/svg',
                './src/module/page/logic/assets/svg',
                './src/module/extension/assets/svg'
            ])
        ],
        resolve: {
            // 配置别名
            alias
        },
        // 一个典型的用例对 optimizeDeps.include 或 optimizeDeps.exclude 是当你有一个不能直接在源码中发现的导入时。例如，导入可能是插件转换的结果。这意味着 Vite 无法在初始扫描时发现导入 —— 它只能在浏览器请求文件并进行转换后发现它。这将导致服务器在启动后立即重新打包。
        // 这样 vite 在执行 runOptimize 的时候中会使用 roolup 对 lodash 包重新编译，将编译成符合 esm 模块规范的新的包放入 node_modules 下的 .vite_opt_cache 中，然后配合 resolver 对 lodash 的导入进行处理：使用编译后的包内容代替原来 lodash 的包的内容，这样就解决了 vite 中不能使用 cjs 包的问题，这部分代码在  depOptimizer.ts 里。
        optimizeDeps: {
            include: ['lodash', 'qs']
        },
        // server服务
        server: {
            // 默认是 3000 端口
            port: Number(viteEnv.VITE_APP_PORT) || 3000,
            // 不默认打开浏览器
            open: false,
            proxy: {
                '/application-ws/': {
                    target: viteEnv.VITE_APP_WS_PROXY_URL,
                    changeOrigin: true,
                    ws: true
                },
                '^/.*-api': {
                    target: viteEnv.VITE_APP_PROXY_URL,
                    changeOrigin: true
                },
                '/deploy-api/': {
                    target: 'https://www.rc3-dev3.ywsoftware.cn:9090',
                    changeOrigin: true
                }
            }
        },
        css: {
            // css预处理器
            preprocessorOptions: {
                scss: {
                    // 引入 index.scss 这样就可以在全局中使用 index.scss中预定义的变量了
                    // ！！注意 一定要加上后面的 ;
                    additionalData: '@import "./src/assets/scss/index.scss";'
                }
            }
        }
    }
    return config
}
)
