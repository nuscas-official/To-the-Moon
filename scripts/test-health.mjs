import { spawn } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

// Read env variables from .env.local
let healthCheckSecret = ''
try {
  const envContent = readFileSync('.env.local', 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (match) {
      const key = match[1]
      let val = match[2].trim()
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1)
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1)
      }
      if (key === 'HEALTH_CHECK_SECRET') {
        healthCheckSecret = val
      }
    }
  })
} catch (e) {
  console.log('Could not read .env.local or find HEALTH_CHECK_SECRET. Using fallback empty string.')
}

console.log('HEALTH_CHECK_SECRET configured:', healthCheckSecret ? 'Yes (masked)' : 'No')

// Start next dev server on port 3001
const devServer = spawn('npx', ['next', 'dev', '-p', '3001'], {
  stdio: 'ignore',
  shell: true
})

console.log('Starting Next.js dev server on port 3001...')

// Clean up helper
function cleanup() {
  console.log('Stopping dev server...')
  devServer.kill('SIGINT')
  process.exit()
}

// Ensure server is killed on exit
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('exit', () => {
  devServer.kill('SIGINT')
})

// Wait 4 seconds for dev server to boot
setTimeout(async () => {
  try {
    console.log('\n--- Test 1: Request without secret header ---')
    const res1 = await fetch('http://localhost:3001/api/health')
    console.log('Status:', res1.status)
    const text1 = await res1.text()
    console.log('Response:', text1)

    console.log('\n--- Test 2: Request with WRONG secret header ---')
    const res2 = await fetch('http://localhost:3001/api/health', {
      headers: {
        'X-Health-Check-Key': 'wrong-secret-value-123'
      }
    })
    console.log('Status:', res2.status)
    const text2 = await res2.text()
    console.log('Response:', text2)

    if (healthCheckSecret) {
      console.log('\n--- Test 3: Request with CORRECT secret header ---')
      const res3 = await fetch('http://localhost:3001/api/health', {
        headers: {
          'X-Health-Check-Key': healthCheckSecret
        }
      })
      console.log('Status:', res3.status)
      const data3 = await res3.json()
      console.log('Response:', JSON.stringify(data3, null, 2))
    } else {
      console.log('\n--- Test 3: Skipped (no HEALTH_CHECK_SECRET in .env.local) ---')
    }

  } catch (error) {
    console.error('Error during testing:', error)
  } finally {
    cleanup()
  }
}, 4000)
