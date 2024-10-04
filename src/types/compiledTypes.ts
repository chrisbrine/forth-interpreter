import { ValueTypes } from "@/compiler/types";
import { StackItemValue, StackItemValueType } from "@/types/compiledItemValue";

export type char = { 0: string; length: 1 } & string;

interface ValueTypeBase {
  type: StackItemValueType;
  label: (
    item: StackItemValue,
    obj: ValueTypes,
    data: Record<string, unknown>,
  ) => string;
  verify: (item: StackItemValue) => boolean;
  create: (
    type: StackItemValueType,
    data: Record<string, unknown> & { lineNo: number; value?: unknown },
    obj: ValueTypes,
  ) => StackItemValue;
  char: char;
}

export interface ValueTypeOther extends ValueTypeBase {
  type: StackItemValueType.other;
  name: string;
}

interface ValueTypeAll extends ValueTypeBase {
  type: Exclude<StackItemValueType, StackItemValueType.other>;
}

export type ValueType = ValueTypeAll | ValueTypeOther;
