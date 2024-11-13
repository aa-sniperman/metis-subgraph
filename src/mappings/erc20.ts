import { log } from "matchstick-as";
import {
  Transfer as TransferEvent
} from "../../generated/ERC20/ERC20";
import { Token, TokenCreation, TokenHolder } from "../../generated/schema";
import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, fetchTokenTotalSupply } from "../utils/token";
import { getSubgraphConfig, SubgraphConfig } from "../utils/chains";
import { fetchAndSaveTokenCreator } from "./wallet";

function fetchToken(tokenAddress: Address, subgraphConfig: SubgraphConfig = getSubgraphConfig()): Token | null {
  const tokenOverrides = subgraphConfig.tokenOverrides;
  const token = new Token(tokenAddress.toHexString());
  token.symbol = fetchTokenSymbol(tokenAddress, tokenOverrides);
  token.name = fetchTokenName(tokenAddress, tokenOverrides);
  token.totalSupply = fetchTokenTotalSupply(tokenAddress);
  const decimals = fetchTokenDecimals(tokenAddress, tokenOverrides);

  if (decimals === null) {
    log.debug('Token at address {} has null decimals', [tokenAddress.toHexString()]);
    return null;
  }

  token.decimals = decimals;
  return token;
}

function populateNewToken(tokenAddress: Address,
  subgraphConfig: SubgraphConfig = getSubgraphConfig()
): void {
  const token = fetchToken(tokenAddress, subgraphConfig);
  if (token)
    token.save();
}

function updateTokenTotalSupply(tokenAddress: Address, amount: BigInt, isMint: boolean): void {
  let token = Token.load(tokenAddress.toHexString());
  if (!token) {
    populateNewToken(tokenAddress);
    token = Token.load(tokenAddress.toHexString());
    if (!token) return;  // If token still doesn't load, exit early
  }

  // Adjust total supply based on mint or burn action
  if (isMint) {
    token.totalSupply = token.totalSupply.plus(amount);
  } else {
    token.totalSupply = token.totalSupply.minus(amount);
  }

  token.save();
}

export function handleTokenCreation(event: TransferEvent): void {
  const tokenAddress = event.address;
  const existingToken = Token.load(tokenAddress.toHexString());

  if (existingToken === null) {
    populateNewToken(tokenAddress);
    
    const creatorAddress = event.transaction.from;
    const creator = fetchAndSaveTokenCreator(tokenAddress, creatorAddress);
    let tokenCreation = new TokenCreation(event.transaction.hash.concatI32(event.logIndex.toI32()));
    tokenCreation.tokenAddress = event.address;
    tokenCreation.recipient = event.params.to;
    tokenCreation.amount = event.params.value;
    tokenCreation.timestamp = event.block.timestamp;
    tokenCreation.transactionHash = event.transaction.hash;
    tokenCreation.creator = creator.id;

    log.info("TokenCreation ID: {}", [tokenCreation.id.toHexString()]);

    tokenCreation.save();
  }

  // Update the total supply for minting
  updateTokenTotalSupply(tokenAddress, event.params.value, true);
}

export function handleTokenHoldingChange(event: TransferEvent): void {
  let tokenAddress = event.address.toHexString();

  // Create unique IDs for the TokenHolder entities by concatenating token address and holder address
  let fromHolderId = tokenAddress + "-" + event.params.from.toHexString();
  let toHolderId = tokenAddress + "-" + event.params.to.toHexString();

  // Load or create the TokenHolder entities for `from` and `to`
  let fromHolder = TokenHolder.load(fromHolderId);
  if (fromHolder == null) {
    fromHolder = new TokenHolder(fromHolderId);
    fromHolder.balance = BigInt.fromI32(0);
    fromHolder.token = event.address;
    fromHolder.holder = event.params.from;
  }

  let toHolder = TokenHolder.load(toHolderId);
  if (toHolder == null) {
    toHolder = new TokenHolder(toHolderId);
    toHolder.balance = BigInt.fromI32(0);
    toHolder.token = event.address;
    toHolder.holder = event.params.to;
  }

  // Update balances and lastUpdated timestamp
  fromHolder.balance = fromHolder.balance >= event.params.value
    ? fromHolder.balance.minus(event.params.value)
    : BigInt.fromI32(0);
  fromHolder.lastUpdated = event.block.timestamp;

  toHolder.balance = toHolder.balance.plus(event.params.value);
  toHolder.lastUpdated = event.block.timestamp;

  // Save or remove the fromHolder if the balance is zero
  fromHolder.save();

  // Save the toHolder entity
  toHolder.save();
}

export function handleTokenTransfer(event: TransferEvent): void {
  let zeroAddress = "0x0000000000000000000000000000000000000000";

  if (event.params.from.toHexString() == zeroAddress) {
    // Minting event (from zero address)
    handleTokenCreation(event);
  } else if (event.params.to.toHexString() == zeroAddress) {
    // Burning event (to zero address)
    updateTokenTotalSupply(event.address, event.params.value, false);
  }

  // Handle transfer as balance update
  handleTokenHoldingChange(event);
}
