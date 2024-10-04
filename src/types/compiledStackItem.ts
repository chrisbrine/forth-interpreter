import { StackItemValue } from "@/types/compiledItemValue";
import { StackItemLoop } from "@/types/compiledLoopType";
import { Variables } from "@/types/compiledVariable";
import { StackFn } from "@/types/stack";

export enum StackItemType {
  value = "value",
  function = "function",
  conditional = "conditional",
  loop = "loop",
}

export interface StackItemBase {
  type: StackItemType;
  lineNo: number;
}

export interface StackItemFunction extends StackItemBase {
  type: StackItemType.function;
  value: string;
  stackFn?: StackFn;
}

export interface StackItemConditional extends StackItemBase {
  type: StackItemType.conditional;
  value: StackItem[];
  variables: Variables;
  inElse: boolean;
  else: StackItem[];
}

export type StackItem =
  | StackItemValue
  | StackItemFunction
  | StackItemLoop
  | StackItemConditional;
