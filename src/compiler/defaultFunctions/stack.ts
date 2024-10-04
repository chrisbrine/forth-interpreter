import { CompileError } from "@/errors/compiler";
import { StackItemValueType } from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";
import { StackFn } from "@/types/stack";

export const stackFns: [string, StackFn][] = [
  [
    "pop",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Empty stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
      },
  ],
  [
    "popn",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // pop n number of items from the stack
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Empty or no number on top of stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const n = item.value;
        if (n + 1 > stack.length) {
          throw new CompileError({
            name,
            message: "Not enough items in stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (n > 0) {
          stack.splice(-n);
        }
      },
  ],
  [
    "depth",
    ({ valueTypes, lineNo }) =>
      (stack) =>
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: stack.length,
            lineNo,
          }),
        ),
  ],
  [
    "dup",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // duplicate last item on stack
        const item = stack.pop();
        if (!item) {
          throw new CompileError({
            name,
            message: "Empty stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(item);
        const duplicateItem = JSON.parse(JSON.stringify(item)) as typeof item;
        stack.push(duplicateItem);
      },
  ],
  [
    "dupn",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // duplicate n number of items in stack
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Empty or no number on top of stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const n = item.value;
        if (n > 0) {
          const items = stack.slice(-n);
          if (items.length < n) {
            throw new CompileError({
              name,
              message: "Not enough items in stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          items.forEach((item) => {
            const duplicateItem = JSON.parse(
              JSON.stringify(item),
            ) as typeof item;
            stack.push(duplicateItem);
          });
        }
      },
  ],
  [
    "ldup",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // duplicates a stack range which is: x1 x2 x3 3 => x1 x2 x3 3 x1 x2 x3 3
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Empty or no number on top of stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const n = item.value;
        if (n > 0) {
          const items = stack.slice(-n);
          if (items.length < n) {
            throw new CompileError({
              name,
              message: "Not enough items in stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          stack.push(item);
          items.forEach((item) => {
            const duplicateItem = JSON.parse(
              JSON.stringify(item),
            ) as typeof item;
            stack.push(duplicateItem);
          });
          const duplicateItem = JSON.parse(JSON.stringify(item)) as typeof item;
          stack.push(duplicateItem);
        }
      },
  ],
  [
    "lreverse",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // will reverse x numbers then re-add the x after. ie. x1 x2 x3 3 = x3 x2 x1 3
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Empty or no number on top of stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const n = item.value;
        if (n > 0) {
          const items = stack.splice(-n);
          if (items.length < n) {
            throw new CompileError({
              name,
              message: "Not enough items in stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          items.reverse().forEach((item) => stack.push(item));
          const duplicateItem = JSON.parse(JSON.stringify(item)) as typeof item;
          stack.push(duplicateItem);
        }
      },
  ],
  [
    "over",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // duplicates the second to top item on the stack to the top. ie. x1 x2 => x1 x2 x1
        const item = stack.pop();
        const item2 = stack.pop();
        if (!item || !item2) {
          throw new CompileError({
            name,
            message: "Empty or not enough items on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(item2);
        stack.push(item);
        const duplicateItem = JSON.parse(JSON.stringify(item2)) as typeof item2;
        stack.push(duplicateItem);
      },
  ],
  [
    "pick",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // pick the nth item from the stack and move it to the top. ie. x1 x2 x3 2 => x1 x2 x3 x2
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Empty or no number on top of stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const n = item.value;
        if (n + 1 > stack.length) {
          throw new CompileError({
            name,
            message: "Not enough items in stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (n > 0) {
          const item = stack.slice(-n, 1)[0];
          if (!item) {
            throw new CompileError({
              name,
              message: "Not enough items in stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          const duplicateItem = JSON.parse(JSON.stringify(item)) as typeof item;
          stack.push(duplicateItem);
        }
      },
  ],
  [
    "put",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // takes nx...n1 ni i and replaces the ith item with ni and returns nx...ni...n1
        // ie. "a" "b" c" "d" "e" 3 put => "a" "e" "c" "d"
        const item = stack.pop();
        const item2 = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.number ||
          !item2
        ) {
          throw new CompileError({
            name,
            message:
              "Empty or no number on top of stack or not enough items on stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const n = item.value;
        if (n + 1 > stack.length) {
          throw new CompileError({
            name,
            message: "Not enough items in stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack[stack.length - n - 1] = item2;
      },
  ],
  [
    "reverse",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // Reverses the order of the top i items on the stack, returning the number of items reversed.
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Empty or no number on top of stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const n = item.value;
        if (n > 0) {
          const items = stack.splice(-n);
          if (items.length < n) {
            throw new CompileError({
              name,
              message: "Not enough items in stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          items.reverse().forEach((item) => stack.push(item));
          const duplicateItem = JSON.parse(JSON.stringify(item)) as typeof item;
          stack.push(duplicateItem);
        }
      },
  ],
  [
    "rot",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // rotate the top three items on the stack
        const item = stack.pop();
        const item2 = stack.pop();
        const item3 = stack.pop();
        if (!item || !item2 || !item3) {
          throw new CompileError({
            name,
            message: "Empty or not enough items on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(item2);
        stack.push(item);
        stack.push(item3);
      },
  ],
  [
    "rotate",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // rotates the top n things on the stack. ( ni ... n1 i -- n(i-1) ... n1 ni )
        const item = stack.pop();
        if (
          !item ||
          item.type !== StackItemType.value ||
          item.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Empty or no number on top of stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const n = item.value;
        if (n + 1 > stack.length) {
          throw new CompileError({
            name,
            message: "Not enough items in stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const items = stack.splice(-n);
        const firstItem = items.shift();
        if (!firstItem) {
          throw new CompileError({
            name,
            message: "Not enough items in stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        items.push(firstItem);
        items.forEach((item) => stack.push(item));
      },
  ],
  [
    "swap",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // swap the top two items on the stack
        const item = stack.pop();
        const item2 = stack.pop();
        if (!item || !item2) {
          throw new CompileError({
            name,
            message: "Empty or not enough items on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        stack.push(item);
        stack.push(item2);
      },
  ],
];
