import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'

import { StaticTokenDefinition } from './staticTokenDefinition'

// Note: All token and pool addresses should be lowercased!
export class SubgraphConfig {
  factoryV2Address: string

  factoryV3Address: string;

  // the address of a pool where one token is a stablecoin and the other is a
  // token that tracks the price of the native token use this to calculate the
  // price of the native token, so prefer a pool with highest liquidity
  stablecoinWrappedNativePoolAddress: string

  // true is stablecoin is token0, false if stablecoin is token1
  stablecoinIsToken0: boolean

  // the address of a token that tracks the price of the native token, most of
  // the time, this is a wrapped asset but could also be the native token itself
  // for some chains
  wrappedNativeAddress: string

  // the mimimum liquidity in a pool needed for it to be used to help calculate
  // token prices. for new chains, this should be initialized to ~4000 USD
  minimumNativeLocked: BigDecimal

  // list of stablecoin addresses
  stablecoinAddresses: string[]

  // a token must be in a pool with one of these tokens in order to derive a
  // price (in addition to passing the minimumEthLocked check). This is also
  // used to determine whether volume is tracked or not.
  whitelistTokens: string[]

  // token overrides are used to override RPC calls for the symbol, name, and
  // decimals for tokens. for new chains this is typically empty.
  tokenOverrides: StaticTokenDefinition[]
}

export function getSubgraphConfig(): SubgraphConfig {
  return {
    factoryV2Address: '0xF38E7c7f8eA779e8A193B61f9155E6650CbAE095',
    factoryV3Address: '0xC5BfA92f27dF36d268422EE314a1387bB5ffB06A',
    stablecoinWrappedNativePoolAddress: '0xa4e4949e0cccd8282f30e7e113d8a551a1ed1aeb', // WMETIS-USDC 0.3% pool
    stablecoinIsToken0: false,
    wrappedNativeAddress: '0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481', // WMETIS
    minimumNativeLocked: BigDecimal.fromString('20'),
    stablecoinAddresses: [
      '0xea32a96608495e54156ae48931a7c20f0dcc1a21', // USDC
      '0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc', // USDT
    ],
    whitelistTokens: [
      '0x420000000000000000000000000000000000000a', // WETH
      '0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481', // WMETIS
      '0xea32a96608495e54156ae48931a7c20f0dcc1a21', // USDC
      '0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc', // USDT
    ],
    tokenOverrides: [
      {
        address: Address.fromString('0x420000000000000000000000000000000000000a'),
        symbol: 'WETH',
        name: 'Ether',
        decimals: BigInt.fromI32(18),
      },
      {
        address: Address.fromString('0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481'),
        symbol: 'WMETIS',
        name: 'Wrapped METIS',
        decimals: BigInt.fromI32(18),
      },
      {
        address: Address.fromString('0xEA32A96608495e54156Ae48931A7c20f0dcc1a21'),
        symbol: 'm.USDC',
        name: 'USDC Token',
        decimals: BigInt.fromI32(6),
      },
      {
        address: Address.fromString('0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC'),
        symbol: 'm.USDT',
        name: 'USDT Token',
        decimals: BigInt.fromI32(6),
      }
    ]
  }
}
