import { Address, ethereum } from "@graphprotocol/graph-ts";
import { TokenCreator } from "../../generated/schema";
import {
  Transfer as TransferEvent
} from "../../generated/ERC20/ERC20";

export function fetchAndSaveTokenCreator(event: TransferEvent): TokenCreator {
  const token = event.address;
  const creatorAddress = event.transaction.from;
  const creatorId = token.toHexString()
  let creator = new TokenCreator(creatorId)
  creator.nonce = event.transaction.nonce
  creator.address = creatorAddress
  creator.ethBalance = ethereum.getBalance(creatorAddress)

  creator.save()
  return creator
}