/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type Collect = ContractEventLog<{
  tokenId: string;
  userAmount0: string;
  userAmount1: string;
  indexAmount0: string;
  indexAmount1: string;
  pilotAmount: string;
  pool: string;
  recipient: string;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
}>;
export type Deposited = ContractEventLog<{
  pool: string;
  tokenId: string;
  amount0: string;
  amount1: string;
  liquidity: string;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}>;
export type PoolCreated = ContractEventLog<{
  token0: string;
  token1: string;
  pool: string;
  fee: string;
  sqrtPriceX96: string;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}>;
export type PoolReajusted = ContractEventLog<{
  pool: string;
  baseLiquidity: string;
  rangeLiquidity: string;
  newBaseTickLower: string;
  newBaseTickUpper: string;
  newRangeTickLower: string;
  newRangeTickUpper: string;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
}>;
export type Withdrawn = ContractEventLog<{
  pool: string;
  recipient: string;
  tokenId: string;
  amount0: string;
  amount1: string;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}>;

export interface LiquidityManager extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): LiquidityManager;
  clone(): LiquidityManager;
  methods: {
    addressToNftId(
      arg0: string,
      arg1: string
    ): NonPayableTransactionObject<string>;

    collect(
      pilotToken: boolean,
      wethToken: boolean,
      tokenId: number | string | BN,
      data: string | number[]
    ): PayableTransactionObject<void>;

    createPair(
      _token0: string,
      _token1: string,
      data: string | number[]
    ): NonPayableTransactionObject<string>;

    deposit(
      token0: string,
      token1: string,
      sender: string,
      amount0Desired: number | string | BN,
      amount1Desired: number | string | BN,
      shares: number | string | BN,
      data: string | number[]
    ): PayableTransactionObject<{
      amount0Base: string;
      amount1Base: string;
      amount0Range: string;
      amount1Range: string;
      mintedTokenId: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
    }>;

    getReserves(
      token0: string,
      token1: string,
      data: string | number[]
    ): NonPayableTransactionObject<{
      totalAmount0: string;
      totalAmount1: string;
      totalLiquidity: string;
      0: string;
      1: string;
      2: string;
    }>;

    getTotalAmounts(pool: string): NonPayableTransactionObject<{
      fee0: string;
      fee1: string;
      amount0: string;
      amount1: string;
      totalLiquidity: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
    }>;

    getUserFees(tokenId: number | string | BN): NonPayableTransactionObject<{
      fees0: string;
      fees1: string;
      0: string;
      1: string;
    }>;

    liquidityPositions(arg0: string): NonPayableTransactionObject<{
      baseTickLower: string;
      baseTickUpper: string;
      baseLiquidity: string;
      rangeTickLower: string;
      rangeTickUpper: string;
      rangeLiquidity: string;
      fees0: string;
      fees1: string;
      feeGrowthGlobal0: string;
      feeGrowthGlobal1: string;
      totalLiquidity: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: string;
      9: string;
      10: string;
    }>;

    positions(arg0: number | string | BN): NonPayableTransactionObject<{
      nonce: string;
      pool: string;
      liquidity: string;
      feeGrowth0: string;
      feeGrowth1: string;
      tokensOwed0: string;
      tokensOwed1: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
    }>;

    readjustFrequencyStatus(pool: string): NonPayableTransactionObject<boolean>;

    readjustLiquidity(
      token0: string,
      token1: string,
      fee: number | string | BN
    ): NonPayableTransactionObject<void>;

    setPilotProtocolDetails(
      _recipient: string,
      _pilotPercentage: number | string | BN,
      _status: boolean
    ): NonPayableTransactionObject<void>;

    toggleFeesInPilot(pool: string): NonPayableTransactionObject<void>;

    uniswapV3MintCallback(
      amount0Owed: number | string | BN,
      amount1Owed: number | string | BN,
      data: string | number[]
    ): NonPayableTransactionObject<void>;

    uniswapV3SwapCallback(
      amount0Delta: number | string | BN,
      amount1Delta: number | string | BN,
      data: string | number[]
    ): NonPayableTransactionObject<void>;

    updateCoreAddresses(
      oracle_: string,
      ulmState_: string,
      indexFund_: string,
      uniStrategy_: string
    ): NonPayableTransactionObject<void>;

    updateNewPremium(
      _premium: number | string | BN
    ): NonPayableTransactionObject<void>;

    updatePositionTotalAmounts(_pool: string): NonPayableTransactionObject<{
      fee0: string;
      fee1: string;
      amount0: string;
      amount1: string;
      totalLiquidity: string;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
    }>;

    withdraw(
      pilotToken: boolean,
      wethToken: boolean,
      liquidity: number | string | BN,
      tokenId: number | string | BN,
      data: string | number[]
    ): PayableTransactionObject<void>;
  };
  events: {
    Collect(cb?: Callback<Collect>): EventEmitter;
    Collect(options?: EventOptions, cb?: Callback<Collect>): EventEmitter;

    Deposited(cb?: Callback<Deposited>): EventEmitter;
    Deposited(options?: EventOptions, cb?: Callback<Deposited>): EventEmitter;

    PoolCreated(cb?: Callback<PoolCreated>): EventEmitter;
    PoolCreated(
      options?: EventOptions,
      cb?: Callback<PoolCreated>
    ): EventEmitter;

    PoolReajusted(cb?: Callback<PoolReajusted>): EventEmitter;
    PoolReajusted(
      options?: EventOptions,
      cb?: Callback<PoolReajusted>
    ): EventEmitter;

    Withdrawn(cb?: Callback<Withdrawn>): EventEmitter;
    Withdrawn(options?: EventOptions, cb?: Callback<Withdrawn>): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "Collect", cb: Callback<Collect>): void;
  once(event: "Collect", options: EventOptions, cb: Callback<Collect>): void;

  once(event: "Deposited", cb: Callback<Deposited>): void;
  once(
    event: "Deposited",
    options: EventOptions,
    cb: Callback<Deposited>
  ): void;

  once(event: "PoolCreated", cb: Callback<PoolCreated>): void;
  once(
    event: "PoolCreated",
    options: EventOptions,
    cb: Callback<PoolCreated>
  ): void;

  once(event: "PoolReajusted", cb: Callback<PoolReajusted>): void;
  once(
    event: "PoolReajusted",
    options: EventOptions,
    cb: Callback<PoolReajusted>
  ): void;

  once(event: "Withdrawn", cb: Callback<Withdrawn>): void;
  once(
    event: "Withdrawn",
    options: EventOptions,
    cb: Callback<Withdrawn>
  ): void;
}
