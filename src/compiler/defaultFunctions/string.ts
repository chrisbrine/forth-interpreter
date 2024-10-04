import { CompileError } from "@/errors/compiler";
import { StackItemValue, StackItemValueType } from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";
import { StackFn } from "@/types/stack";

export const stringFns: [string, StackFn][] = [
  [
    "explode",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        // takes two strings and will push onto the stack the split string as an array followed by the number of splits
        // if not two strings, then it will crash
        const str2: StackItemValue | undefined = stack.pop();
        const str1: StackItemValue | undefined = stack.pop();
        if (
          !str1 ||
          !str2 ||
          str1.type !== StackItemType.value ||
          str2.type !== StackItemType.value ||
          str1.subType !== StackItemValueType.string ||
          str2.subType !== StackItemValueType.string
        ) {
          throw new CompileError({
            name,
            message: "Not two strings.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const splitStr = str1.value.split(str2.value);
        splitStr.forEach((s) => {
          stack.push(
            valueTypes.toStackItemValue(StackItemValueType.string, {
              value: s,
              lineNo,
            }),
          );
        });
        stack.push(
          valueTypes.toStackItemValue(StackItemValueType.number, {
            value: splitStr.length,
            lineNo,
          }),
        );
      },
  ],
];
