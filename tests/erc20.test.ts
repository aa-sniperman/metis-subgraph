import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  beforeEach
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { handleTokenHoldingChange, handleTokenTransfer } from "../src/mappings/erc20"
import { createTransferEvent } from "./erc20-utils"
import { createAndStoreTestToken, createAndStoreTestTokenHolding, TokenFixture } from "./constants"
import { Token } from "../generated/schema"

// Test structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const token1Address = Address.fromString("0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481")

const token1Fixture: TokenFixture = {
  address: "0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481",
  symbol: "MCK",
  name: "Mock Token",
  totalSupply: "0",
  decimals: "9"
}

const token2Address = Address.fromString("0xea32a96608495e54156ae48931a7c20f0dcc1a21")

const token2Fixture: TokenFixture = {
  address: '0xea32a96608495e54156ae48931a7c20f0dcc1a21',
  symbol: "WRXDIE",
  name: "Wrxdie on the mic",
  totalSupply: "0",
  decimals: "18"
}

const holder1 = Address.fromString("0xEB5491C015b73C3B86F4B4a7E8982d97eC4628ff");
const holder2 = Address.fromString("0xA00a593B4160Fc26aF93Cf5bd88ab475228aaaC5");
const zeroAddress = Address.fromString("0x0000000000000000000000000000000000000000");

describe("Describe entity assertions for TokenHolding", () => {
  beforeEach(() => {
    clearStore();
    createAndStoreTestToken(token1Fixture);
    createAndStoreTestToken(token2Fixture);
  })

  test("test mint token 1", () => {
    const totalSupply = BigInt.fromString("10000");
    const event = createTransferEvent(token1Address, zeroAddress, holder1, totalSupply);
    handleTokenTransfer(event);
    const token1Data = Token.load(token1Address.toHexString());
    assert.assertNotNull(token1Data);
    assert.bigIntEquals(token1Data!.totalSupply, totalSupply);
  })
})
