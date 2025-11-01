import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const resolveRFC = (packageName, subPath = '') => {
  const packagePath = packageName.replace('@react-financial-charts/', '')
  return path.resolve(__dirname, `../react-financial-charts/packages/${packagePath}/src${subPath}`)
}

const findRFCFile = (packageName, filePath) => {
  const basePath = filePath.replace(/\.(ts|tsx)$/, '')
  const extensions = ['.tsx', '.ts']
  
  for (const ext of extensions) {
    const fullPath = resolveRFC(packageName, basePath + ext)
    if (existsSync(fullPath)) {
      return fullPath
    }
  }
  return resolveRFC(packageName, basePath + '.tsx')
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'resolve-rfc-lib-paths',
      resolveId(source) {
        if (source.includes('@react-financial-charts') && source.includes('/lib/')) {
          const newSource = source.replace('/lib/', '/src/').replace(/\.js$/, '')
          const packageMatch = newSource.match(/^(@react-financial-charts\/[^/]+)/)
          if (packageMatch) {
            const packageName = packageMatch[1]
            let restPath = newSource.substring(packageName.length)
            
            restPath = restPath.replace(/\.(ts|tsx)$/, '')
            
            const resolved = findRFCFile(packageName, restPath)
            return resolved
          }
        }
        return null
      }
    }
  ],
  resolve: {
    alias: {
      'react-financial-charts': path.resolve(__dirname, '../react-financial-charts/packages/charts/src/index.ts'),
      '@react-financial-charts/core': path.resolve(__dirname, '../react-financial-charts/packages/core/src/index.ts'),
      '@react-financial-charts/tooltip': path.resolve(__dirname, '../react-financial-charts/packages/tooltip/src/index.ts'),
      '@react-financial-charts/annotations': path.resolve(__dirname, '../react-financial-charts/packages/annotations/src/index.ts'),
      '@react-financial-charts/axes': path.resolve(__dirname, '../react-financial-charts/packages/axes/src/index.ts'),
      '@react-financial-charts/coordinates': path.resolve(__dirname, '../react-financial-charts/packages/coordinates/src/index.ts'),
      '@react-financial-charts/indicators': path.resolve(__dirname, '../react-financial-charts/packages/indicators/src/index.ts'),
      '@react-financial-charts/interactive': path.resolve(__dirname, '../react-financial-charts/packages/interactive/src/index.ts'),
      '@react-financial-charts/scales': path.resolve(__dirname, '../react-financial-charts/packages/scales/src/index.ts'),
      '@react-financial-charts/series': path.resolve(__dirname, '../react-financial-charts/packages/series/src/index.ts'),
      '@react-financial-charts/utils': path.resolve(__dirname, '../react-financial-charts/packages/utils/src/index.ts'),
    }
  },
  optimizeDeps: {
    exclude: [
      'react-financial-charts',
      '@react-financial-charts/core',
      '@react-financial-charts/tooltip',
      '@react-financial-charts/annotations',
      '@react-financial-charts/axes',
      '@react-financial-charts/coordinates',
      '@react-financial-charts/indicators',
      '@react-financial-charts/interactive',
      '@react-financial-charts/scales',
      '@react-financial-charts/series',
      '@react-financial-charts/utils',
    ]
  }
})
