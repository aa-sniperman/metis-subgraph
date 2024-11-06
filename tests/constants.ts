import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Token, TokenHolder } from "../generated/schema";

export class TokenFixture {
  address: string;
  symbol: string
  name: string
  totalSupply: string
  decimals: string
}

export class TokenHolderFixture {
  balance: string;
  holder: string;
  lastUpdated: string;
  token: string;
}

export const createAndStoreTestToken = (tokenFixture: TokenFixture): Token => {
  const token = new Token(tokenFixture.address);
  token.symbol = tokenFixture.symbol
  token.name = tokenFixture.name
  token.decimals = BigInt.fromString(tokenFixture.decimals)
  token.totalSupply = BigInt.fromString(tokenFixture.totalSupply)
  token.save()
  return token;
}

export const createAndStoreTestTokenHolding = (tokenHolderFixture: TokenHolderFixture): TokenHolder => {
  const holderId = tokenHolderFixture.token + "-" + tokenHolderFixture.holder;
  const holder = new TokenHolder(holderId);
  holder.token = Address.fromHexString(tokenHolderFixture.token);
  holder.holder = Address.fromHexString(tokenHolderFixture.holder);
  holder.lastUpdated = BigInt.fromString(tokenHolderFixture.lastUpdated);
  holder.balance = BigInt.fromString(tokenHolderFixture.balance);
  holder.save()
  return holder;
}