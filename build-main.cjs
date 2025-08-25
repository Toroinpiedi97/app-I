const { build } = require('esbuild')
const { join } = require('path')

async function buildMain() {
  try {
    // Build main process
    await build({
      entryPoints: ['src/main.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile: 'dist/main.js',
      external: ['electron'],
      format: 'esm',
      sourcemap: true,
      minify: false,
      // Ensure Node.js compatibility
      nodePaths: ['node_modules'],
      // Bundle all dependencies except electron
      packages: 'external'
    })
    console.log('✅ Main process built successfully')

    // Build preload script (CommonJS for Electron preload)
    await build({
      entryPoints: ['src/preload.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile: 'dist/preload.js',
      external: ['electron'],
      format: 'cjs',
      sourcemap: true,
      minify: false,
      nodePaths: ['node_modules'],
      packages: 'external'
    })
    console.log('✅ Preload script built successfully')

  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

buildMain()
