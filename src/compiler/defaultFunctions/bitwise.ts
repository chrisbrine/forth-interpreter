import { CompileError } from "@/errors/compiler";
import {
  StackItemValueNumber,
  StackItemValueType,
} from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";
import { StackFn } from "@/types/stack";

export const bitwiseFns: [string, StackFn][] = [
  [
    "bitand",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const a = stack.pop() as StackItemValueNumber | undefined;
        const b = stack.pop() as StackItemValueNumber | undefined;
        if (
          !a ||
          !b ||
          a.type !== StackItemType.value ||
          b.type !== StackItemType.value ||
          a.subType !== StackItemValueType.number ||
          b.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Not a proper number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: a.value & b.value,
            lineNo,
          }),
        );
      },
  ],
  [
    "bitor",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const a = stack.pop() as StackItemValueNumber | undefined;
        const b = stack.pop() as StackItemValueNumber | undefined;
        if (
          !a ||
          !b ||
          a.type !== StackItemType.value ||
          b.type !== StackItemType.value ||
          a.subType !== StackItemValueType.number ||
          b.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Not a proper number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: a.value | b.value,
            lineNo,
          }),
        );
      },
  ],
  [
    "bitshift",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        // Shifts the first integer by the second integer's number of bit positions. This works like
        // the C << operator. If the second integer is negative, it is equivalent to >>.
        const a = stack.pop() as StackItemValueNumber | undefined;
        const b = stack.pop() as StackItemValueNumber | undefined;
        if (
          !a ||
          !b ||
          a.type !== StackItemType.value ||
          b.type !== StackItemType.value ||
          a.subType !== StackItemValueType.number ||
          b.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Not a proper number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const shift = a.value < 0 ? b.value >> -a.value : b.value << a.value;
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: shift,
            lineNo,
          }),
        );
      },
  ],
  [
    "bitxor",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const a = stack.pop() as StackItemValueNumber | undefined;
        const b = stack.pop() as StackItemValueNumber | undefined;
        if (
          !a ||
          !b ||
          a.type !== StackItemType.value ||
          b.type !== StackItemType.value ||
          a.subType !== StackItemValueType.number ||
          b.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Not a proper number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: a.value ^ b.value,
            lineNo,
          }),
        );
      },
  ],
];
