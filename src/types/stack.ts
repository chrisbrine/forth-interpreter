import { StackItemValue } from "@/types/compiledItemValue";
import { Variable } from "./compiledVariable";
import { ValueTypes } from "@/compiler/types";

export type StackItem = StackItemValue;

export type Stack = StackItem[];

export interface StackFnOptions {
  name: string /* the StackFn name */;
  programName: string;
  functionName: string;
  lineNo: number;
  variables: StackVariables;
  variableData: StackVariablesData;
  valueTypes: ValueTypes;
  callFunction: (name: string) => void;
}

export type StackVariables = Record<string, StackItemValue>;
export type StackVariablesData = Record<string, Variable>;

export type StackFn = (options: StackFnOptions) => (stack: Stack) => void;
