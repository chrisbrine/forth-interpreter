import { CompileError } from "@/errors/compiler";
import { StackItemValue, StackItemValueType } from "@/types/compiledItemValue";
import { StackFn } from "@/types/stack";
import { getTruthiness } from "@/utils/handle";

type ValueItem =
  | number
  | string
  | boolean
  | null
  | StackItemValue[]
  | Record<string | number, StackItemValue>;

const getCompareValue = (value1: ValueItem, value2: ValueItem): number => {
  if (typeof value1 === "number" && typeof value2 === "number") {
    return value1 - value2;
  }
  if (typeof value1 === "string" && typeof value2 === "string") {
    return value1.localeCompare(value2);
  }
  if (typeof value1 === "boolean" && typeof value2 === "boolean") {
    return value1 === value2 ? 0 : value1 ? 1 : -1;
  }
  if (value1 === null && value2 === null) {
    return 0;
  }
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return value1.length - value2.length;
  }
  if (typeof value1 === "object" && typeof value2 === "object") {
    return value1 && value2
      ? Object.keys(value1).length - Object.keys(value2).length
      : 0;
  }
  return 0;
};

export const conditionalFns: [string, StackFn][] = [
  [
    "<",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack) => {
        const value2 = stack.pop();
        const value1 = stack.pop();
        if (!value1 || !value2) {
          throw new CompileError({
            name,
            message: "Not enough values on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const val1 = "value" in value1 ? value1.value : null;
        const val2 = "value" in value2 ? value2.value : null;
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: getCompareValue(val1 as ValueItem, val2 as ValueItem) < 0,
            lineNo,
          }),
        );
      },
  ],
  [
    "<=",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack) => {
        const value2 = stack.pop();
        const value1 = stack.pop();
        if (!value1 || !value2) {
          throw new CompileError({
            name,
            message: "Not enough values on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const val1 = "value" in value1 ? value1.value : null;
        const val2 = "value" in value2 ? value2.value : null;
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: getCompareValue(val1 as ValueItem, val2 as ValueItem) <= 0,
            lineNo,
          }),
        );
      },
  ],
  [
    ">",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack) => {
        const value2 = stack.pop();
        const value1 = stack.pop();
        if (!value1 || !value2) {
          throw new CompileError({
            name,
            message: "Not enough values on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const val1 = "value" in value1 ? value1.value : null;
        const val2 = "value" in value2 ? value2.value : null;
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: getCompareValue(val1 as ValueItem, val2 as ValueItem) > 0,
            lineNo,
          }),
        );
      },
  ],
  [
    ">=",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack) => {
        const value2 = stack.pop();
        const value1 = stack.pop();
        if (!value1 || !value2) {
          throw new CompileError({
            name,
            message: "Not enough values on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const val1 = "value" in value1 ? value1.value : null;
        const val2 = "value" in value2 ? value2.value : null;
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: getCompareValue(val1 as ValueItem, val2 as ValueItem) >= 0,
            lineNo,
          }),
        );
      },
  ],
  [
    "=",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack) => {
        const value2 = stack.pop();
        const value1 = stack.pop();
        if (!value1 || !value2) {
          throw new CompileError({
            name,
            message: "Not enough values on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const val1 = "value" in value1 ? value1.value : null;
        const val2 = "value" in value2 ? value2.value : null;
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: getCompareValue(val1 as ValueItem, val2 as ValueItem) === 0,
            lineNo,
          }),
        );
      },
  ],
  [
    "!=",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack) => {
        const value2 = stack.pop();
        const value1 = stack.pop();
        if (!value1 || !value2) {
          throw new CompileError({
            name,
            message: "Not enough values on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const val1 = "value" in value1 ? value1.value : null;
        const val2 = "value" in value2 ? value2.value : null;
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: getCompareValue(val1 as ValueItem, val2 as ValueItem) !== 0,
            lineNo,
          }),
        );
      },
  ],
  [
    "not",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack) => {
        const value = stack.pop();
        if (!value) {
          throw new CompileError({
            name,
            message: "Not enough values on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: !getTruthiness(value),
            lineNo,
          }),
        );
      },
  ],
  [
    "or",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack) => {
        const value2 = stack.pop();
        const value1 = stack.pop();
        if (!value1 || !value2) {
          throw new CompileError({
            name,
            message: "Not enough values on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: getTruthiness(value1) || getTruthiness(value2),
            lineNo,
          }),
        );
      },
  ],
  [
    "and",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack) => {
        const value2 = stack.pop();
        const value1 = stack.pop();
        if (!value1 || !value2) {
          throw new CompileError({
            name,
            message: "Not enough values on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: getTruthiness(value1) && getTruthiness(value2),
            lineNo,
          }),
        );
      },
  ],
];
