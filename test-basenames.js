// Test script to verify Basenames integration
const { ethers } = require('ethers');

// Basenames registry contract address on Base mainnet (correct from official repo)
const BASENAMES_REGISTRY_ADDRESS = '0xb94704422c2a1e396835a571837aa5ae53285a95';

// Basenames registry ABI (simplified)
const BASENAMES_REGISTRY_ABI = [
  'function resolver(bytes32 node) external view returns (address)',
  'function owner(bytes32 node) external view returns (address)',
  'function addr(bytes32 node) external view returns (address)',
  'function name(bytes32 node) external view returns (string)',
];

/**
 * Convert a basename to namehash
 */
function namehash(name) {
  let node = '0x0000000000000000000000000000000000000000000000000000000000000000';

  if (name) {
    const labels = name.split('.');
    for (let i = labels.length - 1; i >= 0; i--) {
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(labels[i]));
      node = ethers.keccak256(ethers.concat([node, labelHash]));
    }
  }

  return node;
}

async function testBasenames() {
  console.log('🧪 Testing Basenames Integration...\n');

  // Create Base mainnet provider
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const registryContract = new ethers.Contract(
    BASENAMES_REGISTRY_ADDRESS,
    BASENAMES_REGISTRY_ABI,
    provider
  );

  // Test cases
  const testCases = [
    'cryptarpit.base',
    'vitalik.base',
    'base.base',
    'coinbase.base',
    'test.base'
  ];

  for (const basename of testCases) {
    try {
      console.log(`🔍 Testing: ${basename}`);
      
      // Get namehash
      const node = namehash(basename);
      console.log(`   Namehash: ${node}`);

      // Get resolver address
      const resolverAddress = await registryContract.resolver(node);
      console.log(`   Resolver: ${resolverAddress}`);

      if (resolverAddress === ethers.ZeroAddress) {
        console.log(`   ❌ No resolver found for ${basename}\n`);
        continue;
      }

      // Create resolver contract
      const resolverContract = new ethers.Contract(
        resolverAddress,
        ['function addr(bytes32 node) external view returns (address)'],
        provider
      );

      // Get address from resolver
      const address = await resolverContract.addr(node);
      console.log(`   Address: ${address}`);

      if (address === ethers.ZeroAddress) {
        console.log(`   ❌ No address found for ${basename}\n`);
      } else {
        console.log(`   ✅ ${basename} → ${address}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Test reverse resolution for known address
  console.log('🔄 Testing reverse resolution...');
  try {
    const testAddress = '0x97f14d6031b64f9e82153a69458b5b9af8248ee6';
    const name = await provider.lookupAddress(testAddress);
    if (name && name.endsWith('.base')) {
      console.log(`✅ ${testAddress} → ${name}`);
    } else {
      console.log(`❌ No basename found for ${testAddress}`);
    }
  } catch (error) {
    console.log(`❌ Reverse resolution error: ${error.message}`);
  }
}

testBasenames().catch(console.error);
