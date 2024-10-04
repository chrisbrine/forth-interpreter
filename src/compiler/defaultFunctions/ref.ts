import { CompileError } from "@/errors/compiler";
import { StackItemValue, StackItemValueType } from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";
import { StackFn } from "@/types/stack";

export const refFns: [string, StackFn][] = [
  [
    "jmp",
    ({ name, programName, functionName, lineNo, callFunction }) =>
      (stack) => {
        // will only work if a ref is on the top of the stack, but will call the function by name
        const ref: StackItemValue | undefined = stack.pop();
        if (
          !ref ||
          ref.type !== StackItemType.value ||
          ref.subType !== StackItemValueType.ref
        ) {
          throw new CompileError({
            name,
            message: "Not a proper ref on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        callFunction(ref.value);
      },
  ],
  [
    "execute",
    ({ name, programName, functionName, lineNo, callFunction }) =>
      (stack) => {
        // same as jmp
        const ref: StackItemValue | undefined = stack.pop();
        if (
          !ref ||
          ref.type !== StackItemType.value ||
          ref.subType !== StackItemValueType.ref
        ) {
          throw new CompileError({
            name,
            message: "Not a proper ref on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        callFunction(ref.value);
      },
  ],
];
