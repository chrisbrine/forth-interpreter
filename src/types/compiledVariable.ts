import { ValueType } from "@/types/compiledTypes";
import { StackItemValue } from "@/types/compiledItemValue";

export interface Variable {
  type: ValueType;
  initValue?: unknown | undefined;
  constant: boolean;
  item: StackItemValue | undefined;
  ref: string;
}

export type Variables = Record<string, Variable>;
