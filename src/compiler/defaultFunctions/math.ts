import { CompileError } from "@/errors/compiler";
import {
  StackItemValueFloat,
  StackItemValueNumber,
  StackItemValueType,
} from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";
import { Stack, StackFn } from "@/types/stack";

export const mathFns: [string, StackFn][] = [
  [
    "acos",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const val = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !val ||
          val.type !== StackItemType.value ||
          (val.subType !== StackItemValueType.float &&
            val.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.float, {
            value: Math.acos(val.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "asine",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const val = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !val ||
          val.type !== StackItemType.value ||
          (val.subType !== StackItemValueType.float &&
            val.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.float, {
            value: Math.asin(val.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "atan",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const val = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !val ||
          val.type !== StackItemType.value ||
          (val.subType !== StackItemValueType.float &&
            val.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.float, {
            value: Math.atan(val.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "atan2",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const y = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        const x = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !y ||
          !x ||
          y.type !== StackItemType.value ||
          x.type !== StackItemType.value ||
          (y.subType !== StackItemValueType.float &&
            y.subType !== StackItemValueType.number) ||
          (x.subType !== StackItemValueType.float &&
            x.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.float, {
            value: Math.atan2(y.value, x.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "ceil",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const val = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !val ||
          val.type !== StackItemType.value ||
          (val.subType !== StackItemValueType.float &&
            val.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: Math.ceil(val.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "cos",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const val = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !val ||
          val.type !== StackItemType.value ||
          (val.subType !== StackItemValueType.float &&
            val.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.float, {
            value: Math.cos(val.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "dist3d",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const z = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        const y = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        const x = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !z ||
          !y ||
          !x ||
          z.type !== StackItemType.value ||
          y.type !== StackItemType.value ||
          x.type !== StackItemType.value ||
          (z.subType !== StackItemValueType.float &&
            z.subType !== StackItemValueType.number) ||
          (y.subType !== StackItemValueType.float &&
            y.subType !== StackItemValueType.number) ||
          (x.subType !== StackItemValueType.float &&
            x.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.float, {
            value: Math.sqrt(x.value ** 2 + y.value ** 2 + z.value ** 2),
            lineNo,
          }),
        );
      },
  ],
  [
    "exp",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const val = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !val ||
          val.type !== StackItemType.value ||
          (val.subType !== StackItemValueType.float &&
            val.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.float, {
            value: Math.exp(val.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "fabs",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const val = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !val ||
          val.type !== StackItemType.value ||
          (val.subType !== StackItemValueType.float &&
            val.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(val.subType, {
            value: Math.abs(val.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "abs",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const val = stack.pop() as
          | StackItemValueNumber
          | StackItemValueFloat
          | undefined;
        if (
          !val ||
          val.type !== StackItemType.value ||
          (val.subType !== StackItemValueType.float &&
            val.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            line: lineNo,
            program: programName,
            fn: functionName,
            message: "Not a proper number.",
          });
        }
        stack.push(
          valueTypes.toStackItemValue(val.subType, {
            value: Math.abs(val.value),
            lineNo,
          }),
        );
      },
  ],
];
