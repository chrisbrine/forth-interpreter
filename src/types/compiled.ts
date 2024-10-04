import { StackItem } from "@/types/compiledStackItem";
import { ValueType } from "@/types/compiledTypes";
import { Variables } from "@/types/compiledVariable";
import { StackVariables, StackVariablesData } from "./stack";

export type CompiledPrograms = Record<string, CompiledProgram>;

export interface CompiledProgram {
  name: string;
  variables: Variables;
  exports: Set<string>;
  functions: CompiledFunctions;
  stackVariableData: StackVariablesData;
  stackVariables: StackVariables;
}

export type CompiledFunctions = Record<string, CompiledFunction>;

export interface CompiledFunction {
  name: string;
  value: StackItem[];
  lineNo: number;
  variables: Variables;
  inputs: ValueType[];
  outputs: ValueType[];
}
