import { CompileError } from "@/errors/compiler";
import { StackItemValue, StackItemValueType } from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";
import { StackFn } from "@/types/stack";

export const variableFns: [string, StackFn][] = [
  [
    "@",
    ({ name, programName, functionName, lineNo, variables }) =>
      (stack) => {
        // this will be a function that will get the value of a variable at the top of the stack
        // if not a variable type, then it will crash
        // if the variable doesn't exist, it will crash

        // get the variable name
        const variable: StackItemValue | undefined = stack.pop();
        if (
          !variable ||
          variable.type !== StackItemType.value ||
          variable.subType !== StackItemValueType.variable ||
          !variable.refId ||
          !(variable.refId in variables)
        ) {
          throw new CompileError({
            name,
            message: "Not a proper variable.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }

        // get the variable value
        const variableValue = variables[variable.refId];
        stack.push(variableValue);
      },
  ],
  [
    "!",
    ({ name, programName, functionName, lineNo, variables, variableData }) =>
      (stack) => {
        // should be a function that sets the value of a variable
        // if not a variable type, then it will crash

        // get the variable name
        const variable: StackItemValue | undefined = stack.pop();
        if (
          !variable ||
          variable.type !== StackItemType.value ||
          variable.subType !== StackItemValueType.variable ||
          !variable.refId
        ) {
          throw new CompileError({
            name,
            message: "Not a proper variable.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }

        // get the variable data with ref id
        const data = variableData[variable.refId];
        if (!data) {
          throw new CompileError({
            name,
            message: "No variable data found.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }

        // check if a constant
        if (data.constant) {
          throw new CompileError({
            name,
            message: "Cannot assign to a constant variable.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }

        // get the variable value
        const variableValue = stack.pop();

        if (!variableValue) {
          throw new CompileError({
            name,
            message: "No value to assign to variable.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }

        variables[variable.refId] = variableValue;
      },
  ],
];
