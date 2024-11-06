import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { handleTokenCreation } from "../src/mappings/erc20"
import { createTransferEvent } from "./erc20-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let from = Address.fromString("0x0000000000000000000000000000000000000000")
    let to = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let value = BigInt.fromI32(234)
    let event = createTransferEvent(from, to, value)
    handleTokenCreation(event)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Approval created and stored", () => {
    assert.entityCount("TokenCreation", 1)
  
    // Adjust the ID here if necessary
    assert.fieldEquals(
      "TokenCreation",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000",  // Match the actual ID generated
      "tokenAddress",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
    )
    assert.fieldEquals(
      "TokenCreation",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000",
      "recipient",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "TokenCreation",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000",
      "amount",
      "234"
    )
  })
  
})
