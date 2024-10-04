// import { CompileError } from "@/errors/compiler";
import {
  // StackItemValue,
  // StackItemValueArray,
  // StackItemValueDictionary,
  // StackItemValueFloat,
  StackItemValueNumber,
  // StackItemValueString,
  StackItemValueType,
} from "@/types/compiledItemValue";
import { StackFn } from "@/types/stack";

export const timeFns: [string, StackFn][] = [
  [
    "systime",
    ({ valueTypes, lineNo }) =>
      (stack) => {
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: Date.now(),
            lineNo,
          }) as StackItemValueNumber,
        );
      },
  ],
];
