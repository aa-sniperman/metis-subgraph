import { Address, ethereum } from "@graphprotocol/graph-ts";
import { TokenCreator } from "../../generated/schema";

export function fetchAndSaveTokenCreator(token: Address, creatorAddress: Address): TokenCreator {
  const creatorId = token.toHexString()
  let creator = new TokenCreator(creatorId)
  creator.address = creatorAddress
  creator.ethBalance = ethereum.getBalance(creatorAddress)

  creator.save()
  return creator
}