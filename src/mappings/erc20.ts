import { log } from "matchstick-as";
import {
  Transfer as TransferEvent
} from "../../generated/ERC20/ERC20"
import { Token, TokenCreation, TokenHolder } from "../../generated/schema"
import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, fetchTokenTotalSupply } from "../utils/token";
import { getSubgraphConfig, SubgraphConfig } from "../utils/chains";

function populateNewToken(tokenAddress: Address,
  subgraphConfig: SubgraphConfig = getSubgraphConfig()
): void {
  const tokenOverrides = subgraphConfig.tokenOverrides;
  const token = new Token(tokenAddress.toHexString());
  token.symbol = fetchTokenSymbol(tokenAddress, tokenOverrides)
  token.name = fetchTokenName(tokenAddress, tokenOverrides)
  token.totalSupply = fetchTokenTotalSupply(tokenAddress)
  const decimals = fetchTokenDecimals(tokenAddress, tokenOverrides)

  if (decimals === null) {
    log.debug('Token at address {} has null decimals', [tokenAddress.toHexString()])
    return
  }

  token.decimals = decimals
  token.save()
}

export function handleTokenCreation(event: TransferEvent): void {
  const tokenAddress = event.address;
  const existingToken = Token.load(tokenAddress.toHexString());

  if (existingToken === null) {
    let tokenCreation = new TokenCreation(event.transaction.hash.concatI32(event.logIndex.toI32()));
    tokenCreation.tokenAddress = event.address;
    tokenCreation.recipient = event.params.to;
    tokenCreation.amount = event.params.value;
    tokenCreation.timestamp = event.block.timestamp;
    tokenCreation.transactionHash = event.transaction.hash;

    log.info("TokenCreation ID: {}", [tokenCreation.id.toHexString()])

    tokenCreation.save();
    populateNewToken(tokenAddress);
  }
}

export function handleTokenHoldingChange(event: TransferEvent): void {
  let tokenAddress = event.address.toHexString()
  let fromHolderId = tokenAddress + "-" + event.params.from.toHexString()
  let toHolderId = tokenAddress + "-" + event.params.to.toHexString()

  let fromHolder = TokenHolder.load(fromHolderId)
  if (fromHolder == null) {
    fromHolder = new TokenHolder(fromHolderId)
    fromHolder.balance = BigInt.fromI32(0)
  }

  let toHolder = TokenHolder.load(toHolderId)
  if (toHolder == null) {
    toHolder = new TokenHolder(toHolderId)
    toHolder.balance = BigInt.fromI32(0)
  }

  fromHolder.balance = fromHolder.balance >= event.params.value
    ? fromHolder.balance.minus(event.params.value)
    : BigInt.fromI32(0)
  fromHolder.lastUpdated = event.block.timestamp

  toHolder.balance = toHolder.balance.plus(event.params.value)
  toHolder.lastUpdated = event.block.timestamp

  if (fromHolder.balance.gt(BigInt.fromI32(0))) {
    fromHolder.save()
  } else {
    store.remove("TokenHolder", fromHolderId)
  }
  toHolder.save()
}

export function handleTokenTransfer(event: TransferEvent): void {
  let zeroAddress = "0x0000000000000000000000000000000000000000"
  if (event.params.from.toHexString() == zeroAddress) {
    handleTokenCreation(event);
  }
  handleTokenHoldingChange(event);
}
