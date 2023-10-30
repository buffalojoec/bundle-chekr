import {
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  mapEncoder,
} from "@solana/codecs-core";
import {
  getStructEncoder,
  getStructDecoder,
} from "@solana/codecs-data-structures";
import {
  getU32Encoder,
  getU64Encoder,
  getU32Decoder,
  getU64Decoder,
} from "@solana/codecs-numbers";
import {
  IAccountMeta,
  IInstruction,
  IInstructionWithData,
  IInstructionWithAccounts,
  WritableSignerAccount,
  WritableAccount,
  Base58EncodedAddress,
  AccountRole,
} from "@solana/web3.js";

export function accountMetaWithDefault<
  TAccount extends string | IAccountMeta<string>,
  TRole extends AccountRole
>(account: TAccount | undefined, role: TRole) {
  if (account === undefined) return undefined;
  return (
    typeof account === "string" ? { address: account, role } : account
  ) as TAccount extends string
    ? { address: Base58EncodedAddress<TAccount>; role: TRole }
    : TAccount;
}

export type TransferSolInstruction<
  TProgram extends string = "11111111111111111111111111111111",
  TAccountSource extends string | IAccountMeta<string> = string,
  TAccountDestination extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountSource extends string
        ? WritableSignerAccount<TAccountSource>
        : TAccountSource,
      TAccountDestination extends string
        ? WritableAccount<TAccountDestination>
        : TAccountDestination,
      ...TRemainingAccounts
    ]
  >;

export type TransferSolInstructionData = {
  discriminator: number;
  amount: bigint;
};

export type TransferSolInstructionDataArgs = { amount: number | bigint };

export function getTransferSolInstructionDataEncoder(): Encoder<TransferSolInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder<{ discriminator: number; amount: number | bigint }>(
      [
        ["discriminator", getU32Encoder()],
        ["amount", getU64Encoder()],
      ],
      { description: "TransferSolInstructionData" }
    ),
    (value) => ({ ...value, discriminator: 2 })
  ) as Encoder<TransferSolInstructionDataArgs>;
}

export function getTransferSolInstructionDataDecoder(): Decoder<TransferSolInstructionData> {
  return getStructDecoder<TransferSolInstructionData>(
    [
      ["discriminator", getU32Decoder()],
      ["amount", getU64Decoder()],
    ],
    { description: "TransferSolInstructionData" }
  ) as Decoder<TransferSolInstructionData>;
}

export function getTransferSolInstructionDataCodec(): Codec<
  TransferSolInstructionDataArgs,
  TransferSolInstructionData
> {
  return combineCodec(
    getTransferSolInstructionDataEncoder(),
    getTransferSolInstructionDataDecoder()
  );
}

export function transferSolInstruction<
  TProgram extends string = "11111111111111111111111111111111",
  TAccountSource extends string | IAccountMeta<string> = string,
  TAccountDestination extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
    source: TAccountSource extends string
      ? Base58EncodedAddress<TAccountSource>
      : TAccountSource;
    destination: TAccountDestination extends string
      ? Base58EncodedAddress<TAccountDestination>
      : TAccountDestination;
  },
  args: TransferSolInstructionDataArgs,
  programAddress: Base58EncodedAddress<TProgram> = "11111111111111111111111111111111" as Base58EncodedAddress<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.source, AccountRole.WRITABLE_SIGNER),
      accountMetaWithDefault(accounts.destination, AccountRole.WRITABLE),
      ...(remainingAccounts ?? []),
    ],
    data: getTransferSolInstructionDataEncoder().encode(args),
    programAddress,
  } as TransferSolInstruction<
    TProgram,
    TAccountSource,
    TAccountDestination,
    TRemainingAccounts
  >;
}
