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
import { Token, TokenHolder } from "../generated/schema"

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
const holder1 = Address.fromString("0xEB5491C015b73C3B86F4B4a7E8982d97eC4628ff");
const holder2 = Address.fromString("0xA00a593B4160Fc26aF93Cf5bd88ab475228aaaC5");
const holder1Id = token1Address.toHexString() + "-" + holder1.toHexString();
const holder2Id = token1Address.toHexString() + "-" + holder2.toHexString();
const zeroAddress = Address.fromString("0x0000000000000000000000000000000000000000");
const zeroHolderId = token1Address.toHexString() + "-" + zeroAddress.toHexString();

describe("Describe entity assertions for TokenHolding", () => {
  beforeEach(() => {
    clearStore();
    createAndStoreTestToken(token1Fixture);
  })

  test("test mint token 1", () => {
    const totalSupply = BigInt.fromString("10000");
    const event = createTransferEvent(token1Address, zeroAddress, holder1, totalSupply);
    handleTokenTransfer(event);
    const token1Data = Token.load(token1Address.toHexString());
    assert.assertNotNull(token1Data);
    assert.bigIntEquals(token1Data!.totalSupply, totalSupply);
  })

  test("test token holdings", () => {
    const initialSupply = BigInt.fromString("10000000");
    const event1 = createTransferEvent(token1Address, zeroAddress, holder1, initialSupply);
    handleTokenTransfer(event1);
    const transferAmount = BigInt.fromString("5000");
    const event2 = createTransferEvent(token1Address, holder1, holder2, transferAmount);
    handleTokenTransfer(event2);
    const holding1 = TokenHolder.load(holder1Id)!;
    assert.bigIntEquals(holding1.balance, initialSupply.minus(transferAmount));
    const holding2 = TokenHolder.load(holder2Id)!;
    assert.bigIntEquals(holding2.balance, transferAmount);
  });

  test("test burn token", () => {
    const initialSupply = BigInt.fromString("10000000");
    const event1 = createTransferEvent(token1Address, zeroAddress, holder1, initialSupply);
    handleTokenTransfer(event1);
    const burnAmount = BigInt.fromString("5000");
    const event2 = createTransferEvent(token1Address, holder1, zeroAddress, burnAmount);
    handleTokenTransfer(event2);
    const holding1 = TokenHolder.load(holder1Id)!;
    assert.bigIntEquals(holding1.balance, initialSupply.minus(burnAmount));
    const zeroHolding = TokenHolder.load(zeroHolderId)!;
    assert.bigIntEquals(zeroHolding.balance, burnAmount);
    const token1Data = Token.load(token1Address.toHexString())!;
    assert.bigIntEquals(token1Data!.totalSupply, initialSupply.minus(burnAmount));
  });
})
