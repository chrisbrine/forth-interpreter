import { StackItemBase, StackItemType } from "@/types/compiledStackItem";
import { char } from "@/types/compiledTypes";

export enum StackItemValueType {
  number = "number",
  float = "float",
  string = "string",
  char = "char",
  boolean = "boolean",
  array = "array",
  dictionary = "dictionary",
  variable = "variable",
  any = "any",
  null = "null",
  ref = "ref",
  other = "other",
}

export interface StackItemValueBase extends StackItemBase {
  type: StackItemType.value;
  label: string;
}

export interface StackItemValueNumber extends StackItemValueBase {
  subType: StackItemValueType.number;
  value: number;
}

export interface StackItemValueFloat extends StackItemValueBase {
  subType: StackItemValueType.float;
  value: number;
}

export interface StackItemValueString extends StackItemValueBase {
  subType: StackItemValueType.string;
  value: string;
}

export interface StackItemValueChar extends StackItemValueBase {
  subType: StackItemValueType.char;
  value: char;
}

export interface StackItemValueBoolean extends StackItemValueBase {
  subType: StackItemValueType.boolean;
  value: boolean;
}

export interface StackItemValueVariable extends StackItemValueBase {
  subType: StackItemValueType.variable;
  refId?: string;
  value: string;
}

export interface StackItemValueArray extends StackItemValueBase {
  subType: StackItemValueType.array;
  value: StackItemValue[];
}

export interface StackItemValueDictionary extends StackItemValueBase {
  subType: StackItemValueType.dictionary;
  value: StackItemValueDictionaryValue;
}

export type StackItemValueArrayValueKeyTypes = string;

export type StackItemValueDictionaryValue = Record<
  StackItemValueArrayValueKeyTypes,
  StackItemValue
>;

export interface StackItemValueNull extends StackItemValueBase {
  subType: StackItemValueType.null;
}

export interface StackItemValueOther extends StackItemValueBase {
  subType: StackItemValueType.other;
  name: string;
  value: unknown;
}

export interface StackItemValueAny extends StackItemValueBase {
  subType: StackItemValueType.any;
  value: StackItemValue;
}

export interface StackItemValueRef extends StackItemValueBase {
  subType: StackItemValueType.ref;
  value: string;
}

export type StackItemValue =
  | StackItemValueNumber
  | StackItemValueFloat
  | StackItemValueString
  | StackItemValueChar
  | StackItemValueBoolean
  | StackItemValueVariable
  | StackItemValueArray
  | StackItemValueDictionary
  | StackItemValueNull
  | StackItemValueOther
  | StackItemValueAny
  | StackItemValueRef;
