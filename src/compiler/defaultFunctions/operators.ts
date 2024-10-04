import { CompileError } from "@/errors/compiler";
import { StackItemValue, StackItemValueType } from "@/types/compiledItemValue";
import { Stack, StackFn } from "@/types/stack";

const convertToStackArray = (
  value: StackItemValue | StackItemValue[],
): StackItemValue[] => {
  if (Array.isArray(value)) {
    return value as StackItemValue[];
  }
  return [value as StackItemValue];
};

export const operatorFns: [string, StackFn][] = [
  [
    "+",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const a = stack.pop();
        const b = stack.pop();
        if (!a || !b) {
          throw new CompileError({
            name,
            message: "Not enough arguments",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        // if two numbers, add them
        if (
          a.subType === StackItemValueType.number &&
          b.subType === StackItemValueType.number
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(b.value + a.value),
              lineNo,
            }),
          );
          return;
        }
        // if number and boolean, then add them together
        if (
          (a.subType === StackItemValueType.number &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.number &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.number ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.number ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(aNum + bNum),
              lineNo,
            }),
          );
          return;
        }
        // if both are floats, then add them together
        if (
          a.subType === StackItemValueType.float &&
          b.subType === StackItemValueType.float
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: b.value + a.value,
              lineNo,
            }),
          );
          return;
        }
        // if one is a number and the other is a float, then add them together
        if (
          (a.subType === StackItemValueType.number &&
            b.subType === StackItemValueType.float) ||
          (b.subType === StackItemValueType.number &&
            a.subType === StackItemValueType.float)
        ) {
          const aNum =
            a.subType === StackItemValueType.number ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.number ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: bNum + aNum,
              lineNo,
            }),
          );
          return;
        }
        // if one is a float, and the other a boolean then add them together
        if (
          (a.subType === StackItemValueType.float &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.float &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.float ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.float ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: bNum + aNum,
              lineNo,
            }),
          );
          return;
        }
        // if both are a boolean convert to integers then add them
        if (
          a.subType === StackItemValueType.boolean &&
          b.subType === StackItemValueType.boolean
        ) {
          const [aNum, bNum] = [a ? 1 : 0, b ? 1 : 0];
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: aNum + bNum,
              lineNo,
            }),
          );
          return;
        }
        // if one is a string, concatenate them
        if (
          a.subType === StackItemValueType.string ||
          b.subType === StackItemValueType.string
        ) {
          const aValue = "value" in a ? a.value : a;
          const bValue = "value" in b ? b.value : b;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.string, {
              value: `${bValue}${aValue}`,
              lineNo,
            }),
          );
          return;
        }
        // if both are arrays, concatenate them
        if (
          a.subType === StackItemValueType.array &&
          b.subType === StackItemValueType.array
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.array, {
              value: [...b.value, ...a.value],
              lineNo,
            }),
          );
          return;
        }
        // if one is an array, push the other to the array
        if (
          a.subType === StackItemValueType.array ||
          b.subType === StackItemValueType.array
        ) {
          const aValue =
            "value" in a
              ? convertToStackArray(Array.isArray(a.value) ? a.value : a)
              : [];
          const bValue =
            "value" in b
              ? convertToStackArray(Array.isArray(b.value) ? b.value : a)
              : [];
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.array, {
              value: [...bValue, ...aValue],
              lineNo,
            }),
          );
          return;
        }
        // if both are dictionaries, concatenate them
        if (
          a.subType === StackItemValueType.dictionary &&
          b.subType === StackItemValueType.dictionary
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.dictionary, {
              value: { ...b.value, ...a.value },
              lineNo,
            }),
          );
          return;
        }

        // error, not valid arguments
        throw new CompileError({
          name,
          message: "Invalid arguments",
          line: lineNo,
          fn: functionName,
          program: programName,
        });
      },
  ],
  [
    "-",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const a = stack.pop();
        const b = stack.pop();
        if (!a || !b) {
          throw new CompileError({
            name,
            message: "Not enough arguments",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        // if two numbers, subtract them
        if (
          a.subType === StackItemValueType.number &&
          b.subType === StackItemValueType.number
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(b.value - a.value),
              lineNo,
            }),
          );
          return;
        }
        // if two floats, subtract them
        if (
          a.subType === StackItemValueType.float &&
          b.subType === StackItemValueType.float
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: b.value - a.value,
              lineNo,
            }),
          );
          return;
        }
        // if one is a number and the other a boolean, subtract them
        if (
          (a.subType === StackItemValueType.number &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.number &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.number ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.number ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(bNum - aNum),
              lineNo,
            }),
          );
          return;
        }
        // if one is a float and the other a boolean, subtract them
        if (
          (a.subType === StackItemValueType.float &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.float &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.float ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.float ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: bNum - aNum,
              lineNo,
            }),
          );
          return;
        }
        // if both are boolean
        if (
          a.subType === StackItemValueType.boolean &&
          b.subType === StackItemValueType.boolean
        ) {
          const [aNum, bNum] = [a ? 1 : 0, b ? 1 : 0];
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: bNum - aNum,
              lineNo,
            }),
          );
          return;
        }
        // if one is a string, remove the first occurrence of the second string
        if (
          a.subType === StackItemValueType.string ||
          b.subType === StackItemValueType.string
        ) {
          const aValue = "value" in a ? (a.value as string) : "";
          const bValue = "value" in b ? (b.value as string) : "";
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.string, {
              value: bValue.replace(aValue, ""),
              lineNo,
            }),
          );
          return;
        }
        // if both are arrays, return the diff between both arrays for ones that do not intersect
        if (
          a.subType === StackItemValueType.array &&
          b.subType === StackItemValueType.array
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.array, {
              value: b.value.filter((item) => !a.value.includes(item)),
              lineNo,
            }),
          );
          return;
        }
        // if one is an array, remove all occurrence of the non array value from the array
        if (
          a.subType === StackItemValueType.array ||
          b.subType === StackItemValueType.array
        ) {
          const aValue =
            "value" in a
              ? convertToStackArray(Array.isArray(a.value) ? a.value : a)
              : [];
          const bValue =
            "value" in b
              ? convertToStackArray(Array.isArray(b.value) ? b.value : a)
              : [];
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.array, {
              value: bValue.filter((item) => !aValue.includes(item)),
              lineNo,
            }),
          );
          return;
        }
        // if both are dictionaries, return the diff between both dictionaries for ones that do not intersect
        if (
          a.subType === StackItemValueType.dictionary &&
          b.subType === StackItemValueType.dictionary
        ) {
          const aKeys = Object.keys(a.value);
          const bKeys = Object.keys(b.value);
          const diff = aKeys
            .filter((key) => !bKeys.includes(key))
            .reduce(
              (acc, key) => {
                acc[key] = a.value[key];
                return acc;
              },
              {} as Record<string | number, StackItemValue>,
            );
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.dictionary, {
              value: diff,
              lineNo,
            }),
          );
          return;
        }
        // error, not valid arguments
        throw new CompileError({
          name,
          message: "Invalid arguments",
          line: lineNo,
          fn: functionName,
          program: programName,
        });
      },
  ],
  [
    "*",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const a = stack.pop();
        const b = stack.pop();
        if (!a || !b) {
          throw new CompileError({
            name,
            message: "Not enough arguments",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        // if two numbers, multiply them
        if (
          a.subType === StackItemValueType.number &&
          b.subType === StackItemValueType.number
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(b.value * a.value),
              lineNo,
            }),
          );
          return;
        }
        // if two floats, multiply them
        if (
          a.subType === StackItemValueType.float &&
          b.subType === StackItemValueType.float
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: b.value * a.value,
              lineNo,
            }),
          );
          return;
        }
        // if one is a number and the other a boolean, multiply them
        if (
          (a.subType === StackItemValueType.number &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.number &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.number ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.number ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(bNum * aNum),
              lineNo,
            }),
          );
          return;
        }
        // if one is a float and the other a boolean, multiply them
        if (
          (a.subType === StackItemValueType.float &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.float &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.float ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.float ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: bNum * aNum,
              lineNo,
            }),
          );
          return;
        }
        // if both are booleans
        if (
          a.subType === StackItemValueType.boolean &&
          b.subType === StackItemValueType.boolean
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: b.value && a.value ? 1 : 0,
              lineNo,
            }),
          );
          return;
        }
        // if one is a string, then second is a number then repeat the string n times
        if (
          a.subType === StackItemValueType.string &&
          b.subType === StackItemValueType.number
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.string, {
              value: Array(b.value).fill(a.value).join(""),
              lineNo,
            }),
          );
          return;
        }
        // if one is an array, and the second is a number then repeat the array n times
        if (
          a.subType === StackItemValueType.array &&
          b.subType === StackItemValueType.number
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.array, {
              value: Array(b.value).fill(a.value).flat(),
              lineNo,
            }),
          );
          return;
        }
        // error, not valid arguments
        throw new CompileError({
          name,
          message: "Invalid arguments",
          line: lineNo,
          fn: functionName,
          program: programName,
        });
      },
  ],
  [
    "/",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const a = stack.pop();
        const b = stack.pop();
        if (!a || !b) {
          throw new CompileError({
            name,
            message: "Not enough arguments",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        // if two numbers, divide them
        if (
          a.subType === StackItemValueType.number &&
          b.subType === StackItemValueType.number
        ) {
          if (a.value === 0) {
            throw new CompileError({
              name,
              message: "Division by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(b.value / a.value),
              lineNo,
            }),
          );
          return;
        }
        // if two floats, divide them
        if (
          a.subType === StackItemValueType.float &&
          b.subType === StackItemValueType.float
        ) {
          if (a.value === 0) {
            throw new CompileError({
              name,
              message: "Division by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: b.value / a.value,
              lineNo,
            }),
          );
          return;
        }
        // if one is a number and the other a boolean, divide them
        if (
          (a.subType === StackItemValueType.number &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.number &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.number ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.number ? b.value : b.value ? 1 : 0;
          if (aNum === 0) {
            throw new CompileError({
              name,
              message: "Division by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(bNum / aNum),
              lineNo,
            }),
          );
          return;
        }
        // if one is a float and the other a boolean, divide them
        if (
          (a.subType === StackItemValueType.float &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.float &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.float ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.float ? b.value : b.value ? 1 : 0;
          if (aNum === 0) {
            throw new CompileError({
              name,
              message: "Division by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: bNum / aNum,
              lineNo,
            }),
          );
          return;
        }
        // if both are boolean change to numbers and divide them
        if (
          a.subType === StackItemValueType.boolean &&
          b.subType === StackItemValueType.boolean
        ) {
          const [aNum, bNum] = [a ? 1 : 0, b ? 1 : 0];
          if (aNum === 0) {
            throw new CompileError({
              name,
              message: "Division by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(bNum / aNum),
              lineNo,
            }),
          );
          return;
        }
        // error, not valid arguments
        throw new CompileError({
          name,
          message: "Invalid arguments",
          line: lineNo,
          fn: functionName,
          program: programName,
        });
      },
  ],
  [
    "%",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const a = stack.pop();
        const b = stack.pop();
        if (!a || !b) {
          throw new CompileError({
            name,
            message: "Not enough arguments",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        // if two numbers, return the modulo
        if (
          a.subType === StackItemValueType.number &&
          b.subType === StackItemValueType.number
        ) {
          if (a.value === 0) {
            throw new CompileError({
              name,
              message: "Modulo by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(b.value % a.value),
              lineNo,
            }),
          );
          return;
        }
        // if two floats, return the modulo
        if (
          a.subType === StackItemValueType.float &&
          b.subType === StackItemValueType.float
        ) {
          if (a.value === 0) {
            throw new CompileError({
              name,
              message: "Modulo by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: b.value % a.value,
              lineNo,
            }),
          );
          return;
        }
        // if one is a number and the other a boolean, return the modulo
        if (
          (a.subType === StackItemValueType.number &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.number &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.number ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.number ? b.value : b.value ? 1 : 0;
          if (aNum === 0) {
            throw new CompileError({
              name,
              message: "Modulo by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(bNum % aNum),
              lineNo,
            }),
          );
          return;
        }
        // if one is a float and the other a boolean, return the modulo
        if (
          (a.subType === StackItemValueType.float &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.float &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.float ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.float ? b.value : b.value ? 1 : 0;
          if (aNum === 0) {
            throw new CompileError({
              name,
              message: "Modulo by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: bNum % aNum,
              lineNo,
            }),
          );
          return;
        }
        // if both are boolean change to numbers and return the modulo
        if (
          a.subType === StackItemValueType.boolean &&
          b.subType === StackItemValueType.boolean
        ) {
          const [aNum, bNum] = [a ? 1 : 0, b ? 1 : 0];
          if (aNum === 0) {
            throw new CompileError({
              name,
              message: "Modulo by zero",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(bNum % aNum),
              lineNo,
            }),
          );
          return;
        }
        // error, not valid arguments
        throw new CompileError({
          name,
          message: "Invalid arguments",
          line: lineNo,
          fn: functionName,
          program: programName,
        });
      },
  ],
  [
    "^",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const a = stack.pop();
        const b = stack.pop();
        if (!a || !b) {
          throw new CompileError({
            name,
            message: "Not enough arguments",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        // if two numbers, return the power
        if (
          a.subType === StackItemValueType.number &&
          b.subType === StackItemValueType.number
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(Math.pow(b.value, a.value)),
              lineNo,
            }),
          );
          return;
        }
        // if two floats, return the power
        if (
          a.subType === StackItemValueType.float &&
          b.subType === StackItemValueType.float
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: Math.pow(b.value, a.value),
              lineNo,
            }),
          );
          return;
        }
        // if one is a number and the other a boolean, return the power
        if (
          (a.subType === StackItemValueType.number &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.number &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.number ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.number ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(Math.pow(bNum, aNum)),
              lineNo,
            }),
          );
          return;
        }
        // if one is a float and the other a boolean, return the power
        if (
          (a.subType === StackItemValueType.float &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.float &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.float ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.float ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: Math.pow(bNum, aNum),
              lineNo,
            }),
          );
          return;
        }
        // if both are boolean change to numbers and return the power
        if (
          a.subType === StackItemValueType.boolean &&
          b.subType === StackItemValueType.boolean
        ) {
          const [aNum, bNum] = [a ? 1 : 0, b ? 1 : 0];
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(Math.pow(bNum, aNum)),
              lineNo,
            }),
          );
          return;
        }
        // error, not valid arguments
        throw new CompileError({
          name,
          message: "Invalid arguments",
          line: lineNo,
          fn: functionName,
          program: programName,
        });
      },
  ],
  [
    "root",
    ({ lineNo, programName, functionName, name, valueTypes }) =>
      (stack: Stack) => {
        const a = stack.pop();
        const b = stack.pop();
        if (!a || !b) {
          throw new CompileError({
            name,
            message: "Not enough arguments",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        // if two numbers, return the root
        if (
          a.subType === StackItemValueType.number &&
          b.subType === StackItemValueType.number
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(Math.pow(b.value, 1 / a.value)),
              lineNo,
            }),
          );
          return;
        }
        // if two floats, return the root
        if (
          a.subType === StackItemValueType.float &&
          b.subType === StackItemValueType.float
        ) {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: Math.pow(b.value, 1 / a.value),
              lineNo,
            }),
          );
          return;
        }
        // if one is a number and the other a boolean, return the root
        if (
          (a.subType === StackItemValueType.number &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.number &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.number ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.number ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(Math.pow(bNum, 1 / aNum)),
              lineNo,
            }),
          );
          return;
        }
        // if one is a float and the other a boolean, return the root
        if (
          (a.subType === StackItemValueType.float &&
            b.subType === StackItemValueType.boolean) ||
          (b.subType === StackItemValueType.float &&
            a.subType === StackItemValueType.boolean)
        ) {
          const aNum =
            a.subType === StackItemValueType.float ? a.value : a.value ? 1 : 0;
          const bNum =
            b.subType === StackItemValueType.float ? b.value : b.value ? 1 : 0;
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.float, {
              value: Math.pow(bNum, 1 / aNum),
              lineNo,
            }),
          );
          return;
        }
        // if both are boolean change to numbers and return the root
        if (
          a.subType === StackItemValueType.boolean &&
          b.subType === StackItemValueType.boolean
        ) {
          const [aNum, bNum] = [a ? 1 : 0, b ? 1 : 0];
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.number, {
              value: Math.floor(Math.pow(bNum, 1 / aNum)),
              lineNo,
            }),
          );
          return;
        }
        // error, not valid arguments
        throw new CompileError({
          name,
          message: "Invalid arguments",
          line: lineNo,
          fn: functionName,
          program: programName,
        });
      },
  ],
];
