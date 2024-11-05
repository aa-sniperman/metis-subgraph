import { log } from "matchstick-as";
import {
  Transfer as TransferEvent
} from "../generated/ERC20/ERC20"
import { TokenCreation } from "../generated/schema"

export function handleTokenCreation(event: TransferEvent): void {
  // Check if `from` address is the zero address
  let tokenCreation = new TokenCreation(event.transaction.hash.concatI32(event.logIndex.toI32()));
  tokenCreation.tokenAddress = event.address;
  tokenCreation.recipient = event.params.to;
  tokenCreation.amount = event.params.value;
  tokenCreation.timestamp = event.block.timestamp;
  tokenCreation.transactionHash = event.transaction.hash;

  log.info("TokenCreation ID: {}", [tokenCreation.id.toHexString()])

  tokenCreation.save();
}
