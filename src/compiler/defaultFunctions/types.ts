import { CompileError } from "@/errors/compiler";
import { StackItemValueType } from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";
import { StackFn } from "@/types/stack";

export const typesFns: [string, StackFn][] = [
  [
    "array?",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Stack is empty.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value:
              item.type === StackItemType.value &&
              item.subType === StackItemValueType.array,
            lineNo,
          }),
        );
      },
  ],
  [
    "dictionary?",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Stack is empty.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value:
              item.type === StackItemType.value &&
              item.subType === StackItemValueType.dictionary,
            lineNo,
          }),
        );
      },
  ],
  [
    "float?",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Stack is empty.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value:
              item.type === StackItemType.value &&
              item.subType === StackItemValueType.float,
            lineNo,
          }),
        );
      },
  ],
  [
    "int?",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Stack is empty.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value:
              item.type === StackItemType.value &&
              item.subType === StackItemValueType.number,
            lineNo,
          }),
        );
      },
  ],
  [
    "number?",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Stack is empty.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value:
              (item.type === StackItemType.value &&
                (item.subType === StackItemValueType.float ||
                  item.subType === StackItemValueType.number)) ||
              ((item.subType === StackItemValueType.char ||
                item.subType === StackItemValueType.string) &&
                !isNaN(Number(item.value))),
            lineNo,
          }),
        );
      },
  ],
  [
    "string?",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Stack is empty.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value:
              item.type === StackItemType.value &&
              (item.subType === StackItemValueType.char ||
                item.subType === StackItemValueType.string),
            lineNo,
          }),
        );
      },
  ],
  [
    "null?",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Stack is empty.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value:
              item.type === StackItemType.value &&
              item.subType === StackItemValueType.null,
            lineNo,
          }),
        );
      },
  ],
  [
    "boolean?",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Stack is empty.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value:
              item.type === StackItemType.value &&
              item.subType === StackItemValueType.boolean,
            lineNo,
          }),
        );
      },
  ],
  [
    "address?",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Stack is empty.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value:
              item.type === StackItemType.value &&
              item.subType === StackItemValueType.ref,
            lineNo,
          }),
        );
      },
  ],
  [
    "atoi",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          (item.subType !== StackItemValueType.string &&
            item.subType !== StackItemValueType.char)
        ) {
          throw new CompileError({
            name,
            message: "Not a string on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: isNaN(Number(item.value)) ? 0 : Number(item.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "ctoi",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          (item.subType !== StackItemValueType.char &&
            item.subType !== StackItemValueType.string)
        ) {
          throw new CompileError({
            name,
            message: "Not a char on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: item.value.charCodeAt(0),
            lineNo,
          }),
        );
      },
  ],
  [
    "float",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          (item.subType !== StackItemValueType.number &&
            item.subType !== StackItemValueType.boolean &&
            item.subType !== StackItemValueType.string)
        ) {
          throw new CompileError({
            name,
            message: "Not a number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const num =
          typeof item.value !== "boolean"
            ? Number(item.value)
            : item.value
              ? 1
              : 0;
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.float, {
            value: isNaN(num) ? 0 : num,
            lineNo,
          }),
        );
      },
  ],
  [
    "ftostr",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          (item.subType !== StackItemValueType.float &&
            item.subType !== StackItemValueType.number)
        ) {
          throw new CompileError({
            name,
            message: "Not a float on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.string, {
            value: item.value.toString(),
            lineNo,
          }),
        );
      },
  ],
  [
    "int",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          (item.subType !== StackItemValueType.number &&
            item.subType !== StackItemValueType.float &&
            item.subType !== StackItemValueType.boolean &&
            item.subType !== StackItemValueType.string)
        ) {
          throw new CompileError({
            name,
            message: "Not a number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const num =
          typeof item.value !== "boolean"
            ? Number(item.value)
            : item.value
              ? 1
              : 0;
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: isNaN(num) ? 0 : Math.floor(num),
            lineNo,
          }),
        );
      },
  ],
  [
    "intostr",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          (item.subType !== StackItemValueType.number &&
            item.subType !== StackItemValueType.float &&
            item.subType !== StackItemValueType.boolean)
        ) {
          throw new CompileError({
            name,
            message: "Not a number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.string, {
            value:
              typeof item.value !== "boolean"
                ? item.value.toString()
                : item.value
                  ? "1"
                  : "0",
            lineNo,
          }),
        );
      },
  ],
  [
    "itoc",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Not a number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.char, {
            value: String.fromCharCode(item.value),
            lineNo,
          }),
        );
      },
  ],
  [
    "strtof",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.string
        ) {
          throw new CompileError({
            name,
            message: "Not a string on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const num = Number(item.value);
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.float, {
            value: isNaN(num) ? 0 : num,
            lineNo,
          }),
        );
      },
  ],
  [
    "tobool",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          (item.subType !== StackItemValueType.string &&
            item.subType !== StackItemValueType.char &&
            item.subType !== StackItemValueType.number &&
            item.subType !== StackItemValueType.float)
        ) {
          throw new CompileError({
            name,
            message: "Not a string on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.boolean, {
            value: !!item.value,
            lineNo,
          }),
        );
      },
  ],
];
