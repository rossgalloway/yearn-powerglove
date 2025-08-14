// Quick test script to verify URL transformation logic
function transformLogoURI(logoURI, chainId, address) {
  // Normalize address to lowercase for URL construction
  const normalizedAddress = address.toLowerCase()

  // Transform assets.smold.app API URLs to direct GitHub URLs
  if (logoURI.startsWith('https://assets.smold.app/api/token/')) {
    return `https://raw.githubusercontent.com/yearn/tokenAssets/main/tokens/${chainId}/${normalizedAddress}/logo-128.png`
  }

  // Transform token-assets-one.vercel.app API URLs to direct GitHub URLs
  if (logoURI.startsWith('https://token-assets-one.vercel.app/api/token/')) {
    return `https://raw.githubusercontent.com/yearn/tokenAssets/main/tokens/${chainId}/${normalizedAddress}/logo-128.png`
  }

  // Return original URL if no transformation needed
  return logoURI
}

// Test cases based on the actual data we saw
const testCases = [
  {
    original:
      'https://token-assets-one.vercel.app/api/token/1/0x0000000000085d4780B73119b644AE5ecd22b376/logo-128.png',
    address: '0x0000000000085d4780B73119b644AE5ecd22b376',
    chainId: 1,
    expected:
      'https://raw.githubusercontent.com/yearn/tokenAssets/main/tokens/1/0x0000000000085d4780b73119b644ae5ecd22b376/logo-128.png',
  },
  {
    original:
      'https://assets.smold.app/api/token/1/0xA0b86A33E778820B4c04A3E9c26F9e0D6c9C40c6/logo-128.png',
    address: '0xA0b86A33E778820B4c04A3E9c26F9e0D6c9C40c6',
    chainId: 1,
    expected:
      'https://raw.githubusercontent.com/yearn/tokenAssets/main/tokens/1/0xa0b86a33e778820b4c04a3e9c26f9e0d6c9c40c6/logo-128.png',
  },
  {
    original:
      'https://tokens.1inch.io/0x0000000000095413afc295d19edeb1ad7b71c952.png',
    address: '0x0000000000095413afC295d19EDeb1Ad7B71c952',
    chainId: 1,
    expected:
      'https://tokens.1inch.io/0x0000000000095413afc295d19edeb1ad7b71c952.png', // No change
  },
]

console.log('🧪 Testing URL transformation logic...\n')

testCases.forEach((testCase, index) => {
  const result = transformLogoURI(
    testCase.original,
    testCase.chainId,
    testCase.address
  )
  const passed = result === testCase.expected

  console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  Original: ${testCase.original}`)
  console.log(`  Expected: ${testCase.expected}`)
  console.log(`  Got:      ${result}`)
  console.log()
})
