import vue from '@vitejs/plugin-vue'
import type { UserConfig } from 'vite'

const config: UserConfig = {
    root: 'test/',
    plugins: [
        vue()
    ],
    server: {
        port: 3001,
        open: false
    }
}

export default config