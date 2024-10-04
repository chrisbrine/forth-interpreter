import { ValueTypes } from "@/compiler/types";
import { InterpreterError } from "@/errors/interpreter";
import { CompiledProgram } from "@/types/compiled";
import {
  StackItemValueArray,
  StackItemValueBoolean,
  StackItemValueChar,
  StackItemValueDictionary,
  StackItemValueFloat,
  StackItemValueNull,
  StackItemValueNumber,
  StackItemValueString,
  StackItemValueType,
} from "@/types/compiledItemValue";
import { StackItemLoop, StackItemLoopType } from "@/types/compiledLoopType";
import {
  StackItem,
  StackItemConditional,
  StackItemType,
} from "@/types/compiledStackItem";
import { ValueType } from "@/types/compiledTypes";
import { Variable } from "@/types/compiledVariable";
import { Stack } from "@/types/stack";
import { getTruthiness } from "@/utils/handle";

type AllowedValues = number | string | boolean | null;

enum LoopCondition {
  break,
  continue,
  repeat,
  until,
}

interface InterpreterProps {
  arrayDepth?: number;
  depth?: number;
}

export class Interpreter {
  private stack: Stack = [];
  private variables: Map<string, Variable> = new Map<string, Variable>();
  private valueTypes: ValueTypes;
  private depth = 10;
  private arrayDepth = 5;

  public constructor(
    private program: CompiledProgram,
    props?: InterpreterProps,
  ) {
    this.valueTypes = new ValueTypes();
    this.handleProps(props || {});
  }

  private handleProps(props: InterpreterProps) {
    if (props.arrayDepth) {
      this.arrayDepth = props.arrayDepth;
    }
    if (props.depth) {
      this.depth = props.depth;
    }
  }

  private argumentsToStackValues(args: AllowedValues[]) {
    // cycle through args to add to the stack
    // strings are surrounded by quotation marks and can take up multiple args
    // numbers are outside of strings, and can either be a float or regular number
    // booleans would always be a true or false if in lowercase (check with lowercase)
    // null would be null
    // they will almost always be a string even if its a number

    let inString = false;
    let currentString = "";
    for (const arg of args) {
      if (typeof arg === "string") {
        if (!inString && (arg[0] === '"' || arg[0] === "'" || arg[0] === "`")) {
          inString = true;
          currentString = arg.slice(1);
        }
        if (
          inString &&
          (arg[arg.length - 1] === '"' ||
            arg[arg.length - 1] === "'" ||
            arg[arg.length - 1] === "`")
        ) {
          inString = false;
          currentString += arg.slice(0, -1);
          if (currentString.length === 1) {
            this.stack.push({
              type: StackItemType.value,
              subType: StackItemValueType.char,
              value: currentString,
            } as StackItemValueChar);
          } else {
            this.stack.push({
              type: StackItemType.value,
              subType: StackItemValueType.string,
              value: currentString,
            } as StackItemValueString);
          }
        } else if (inString) {
          currentString += arg;
        } else {
          // check if it is a number or float
          if (!isNaN(Number(arg))) {
            if (!arg.includes(".")) {
              this.stack.push({
                type: StackItemType.value,
                subType: StackItemValueType.number,
                value: parseInt(arg),
              } as StackItemValueNumber);
            } else {
              this.stack.push({
                type: StackItemType.value,
                subType: StackItemValueType.float,
                value: parseFloat(arg),
              } as StackItemValueFloat);
            }
          } else if (
            arg.toLowerCase() === "true" ||
            arg.toLowerCase() === "false"
          ) {
            this.stack.push({
              type: StackItemType.value,
              subType: StackItemValueType.boolean,
              value: arg.toLowerCase() === "true",
            } as StackItemValueBoolean);
          } else if (arg.toLowerCase() === "null") {
            this.stack.push({
              type: StackItemType.value,
              subType: StackItemValueType.null,
            } as StackItemValueNull);
          } else {
            if (arg.length === 1) {
              this.stack.push({
                type: StackItemType.value,
                subType: StackItemValueType.char,
                value: arg,
              } as StackItemValueChar);
            } else {
              this.stack.push({
                type: StackItemType.value,
                subType: StackItemValueType.string,
                value: arg,
              } as StackItemValueString);
            }
          }
        }
      } else if (typeof arg === "number") {
        if (Number.isInteger(arg)) {
          this.stack.push({
            type: StackItemType.value,
            subType: StackItemValueType.number,
            value: arg,
          } as StackItemValueNumber);
        } else {
          this.stack.push({
            type: StackItemType.value,
            subType: StackItemValueType.float,
            value: arg,
          } as StackItemValueFloat);
        }
      } else if (typeof arg === "boolean") {
        this.stack.push({
          type: StackItemType.value,
          subType: StackItemValueType.boolean,
          value: arg,
        } as StackItemValueBoolean);
      } else if (arg === null) {
        this.stack.push({
          type: StackItemType.value,
          subType: StackItemValueType.null,
        } as StackItemValueNull);
      } else {
        throw new InterpreterError({
          program: this.program.name,
          message: "Invalid argument type passed to interpreter",
        });
      }
    }
  }

  private verifyStack({
    expectedItems,
    lineNo,
    functionName,
  }: {
    expectedItems: ValueType[];
    lineNo: number;
    functionName: string;
  }) {
    if (expectedItems.length !== this.stack.length) {
      throw new InterpreterError({
        program: this.program.name,
        fn: functionName,
        line: lineNo,
        message: `Function ${name} expects ${expectedItems.length} inputs, but ${this.stack.length} were provided`,
      });
    }
    for (let i = 0; i < expectedItems.length; i++) {
      const stackPos = this.stack.length - i;
      if (expectedItems[i].type !== this.stack[stackPos].subType) {
        throw new InterpreterError({
          program: this.program.name,
          fn: functionName,
          line: lineNo,
          message: `Function ${name} expects input ${i} to be of type ${expectedItems[i].type}, but ${this.stack[stackPos].subType} was provided`,
        });
      }
    }
  }

  private instruction(instruction: StackItem): null | LoopCondition {
    switch (instruction.type) {
      case StackItemType.value:
        this.stack.push(instruction);
        break;
      case StackItemType.function:
        if (instruction.stackFn) {
          instruction.stackFn({
            name: instruction.value,
            programName: this.program.name,
            functionName: instruction.value,
            lineNo: instruction.lineNo,
            valueTypes: this.valueTypes,
            variables: this.program.stackVariables,
            variableData: this.program.stackVariableData,
            callFunction: this.executeFunction.bind(this),
          })(this.stack);
        } else {
          this.executeFunction(instruction.value);
        }
        break;
      case StackItemType.conditional:
        this.executeConditional(instruction);
        break;
      case StackItemType.loop:
        if (StackItemLoopType.break) {
          return LoopCondition.break;
        } else if (StackItemLoopType.continue) {
          return LoopCondition.continue;
        } else if (StackItemLoopType.repeat) {
          return LoopCondition.repeat;
        } else if (StackItemLoopType.until) {
          return LoopCondition.until;
        }
        this.executeLoop(instruction);
        break;
      default:
        throw new InterpreterError({
          program: this.program.name,
          message: `Unknown instruction type. This should never happen so do not know why we are here.`,
        });
    }
    return null;
  }

  private executeConditional(instruction: StackItemConditional) {
    const condition = this.stack.pop();
    if (!condition) {
      throw new InterpreterError({
        program: this.program.name,
        fn: "IF",
        line: instruction.lineNo,
        message: "Not enough values on the stack",
      });
    }
    if (getTruthiness(condition)) {
      return instruction.value.map(this.instruction);
    } else {
      return instruction.else.map(this.instruction);
    }
  }

  private executeLoop(instruction: StackItemLoop) {
    let stackItem: StackItemValueArray | StackItemValueDictionary;
    let forInc: number, forEnd: number, forStart: number;
    let endLoop = false;
    const initLoop = () => {
      switch (instruction.subType) {
        case StackItemLoopType.for: {
          const itemInc = this.stack.pop();
          const itemEnd = this.stack.pop();
          const itemStart = this.stack.pop();
          if (
            !itemInc ||
            itemInc.type !== StackItemType.value ||
            itemInc.subType !== StackItemValueType.number ||
            !itemEnd ||
            itemEnd.type !== StackItemType.value ||
            itemEnd.subType !== StackItemValueType.number ||
            !itemStart ||
            itemStart.type !== StackItemType.value ||
            itemStart.subType !== StackItemValueType.number
          ) {
            throw new InterpreterError({
              program: this.program.name,
              fn: "FOR",
              line: instruction.lineNo,
              message:
                "Not enough values on the stack or provided arguments were incorrect values",
            });
          }
          forInc = itemInc.value;
          forEnd = itemEnd.value;
          forStart = itemStart.value;
          if (
            forInc === 0 ||
            (forInc > 0 && forStart >= forEnd) ||
            (forInc < 0 && forStart <= forEnd)
          ) {
            endLoop = true;
          }
          this.stack.push({
            type: StackItemType.value,
            subType: StackItemValueType.number,
            value: forStart,
          } as StackItemValueNumber);
          break;
        }
        case StackItemLoopType.foreach: {
          const item = this.stack.pop();
          if (
            !item ||
            item.type != StackItemType.value ||
            (item.subType !== StackItemValueType.array &&
              item.subType !== StackItemValueType.dictionary)
          ) {
            throw new InterpreterError({
              program: this.program.name,
              fn: "FOREACH",
              line: instruction.lineNo,
              message: "Not enough values on the stack",
            });
          }
          // if length is 0 then end loop
          if (
            (item.subType === StackItemValueType.array &&
              item.value.length === 0) ||
            (item.subType === StackItemValueType.dictionary &&
              Object.keys(item.value).length === 0)
          ) {
            endLoop = true;
          }
          // push first item on either to stack
          const firstItem =
            item.subType === StackItemValueType.array
              ? item.value[0]
              : item.value[Object.keys(item.value)[0]];
          this.stack.push(firstItem);
          if (item.subType === StackItemValueType.array) {
            item.value = item.value.slice(1);
          } else {
            Reflect.deleteProperty(item.value, Object.keys(item.value)[0]);
          }
          stackItem = item;
          break;
        }
        case StackItemLoopType.while: {
          const item = this.stack.pop();
          if (!item) {
            throw new InterpreterError({
              program: this.program.name,
              fn: "WHILE",
              line: instruction.lineNo,
              message: "Not enough values on the stack",
            });
          }
          if (!getTruthiness(item)) {
            endLoop = true;
          }
          break;
        }
        case StackItemLoopType.do:
          break;
      }
    };
    const nextLoop = () => {
      switch (instruction.subType) {
        case StackItemLoopType.for: {
          forStart += forInc;
          if (
            (forInc > 0 && forStart >= forEnd) ||
            (forInc < 0 && forStart <= forEnd)
          ) {
            endLoop = true;
          }
          this.stack.push({
            type: StackItemType.value,
            subType: StackItemValueType.number,
            value: forStart,
          } as StackItemValueNumber);
          break;
        }
        case StackItemLoopType.foreach: {
          if (
            (stackItem.subType === StackItemValueType.array &&
              stackItem.value.length === 0) ||
            (stackItem.subType === StackItemValueType.dictionary &&
              Object.keys(stackItem.value).length === 0)
          ) {
            endLoop = true;
          }
          const firstItem =
            stackItem.subType === StackItemValueType.array
              ? stackItem.value[0]
              : stackItem.value[Object.keys(stackItem.value)[0]];
          this.stack.push(firstItem);
          if (stackItem.subType === StackItemValueType.array) {
            stackItem.value = stackItem.value.slice(1);
          } else {
            Reflect.deleteProperty(
              stackItem.value,
              Object.keys(stackItem.value)[0],
            );
          }
          break;
        }
        case StackItemLoopType.while: {
          const item = this.stack.pop();
          if (!item) {
            throw new InterpreterError({
              program: this.program.name,
              fn: "WHILE",
              line: instruction.lineNo,
              message: "Not enough values on the stack",
            });
          }
          if (!getTruthiness(item)) {
            endLoop = true;
          }
          break;
        }
        case StackItemLoopType.do:
          break;
      }
    };
    initLoop();
    while (!endLoop) {
      if ("value" in instruction) {
        for (const item of instruction.value) {
          const result = this.instruction(item);
          if (result === LoopCondition.break) {
            endLoop = true;
            break;
          } else if (result === LoopCondition.continue) {
            break;
          } else if (result === LoopCondition.repeat) {
            break;
          } else if (result === LoopCondition.until) {
            const item = this.stack.pop();
            if (!item) {
              throw new InterpreterError({
                program: this.program.name,
                fn: "UNTIL",
                line: instruction.lineNo,
                message: "Not enough values on the stack",
              });
            }
            if (getTruthiness(item)) {
              endLoop = true;
              break;
            }
          }
        }
      }
      if (endLoop) {
        break;
      }
      nextLoop();
    }
  }

  private executeFunction(name: string) {
    if (!(name in this.program.functions)) {
      throw new InterpreterError({
        program: this.program.name,
        fn: name,
        message: `Function ${name} does not exist`,
      });
    }

    const fn = this.program.functions[name];
    // verify inputs on top of stack
    this.verifyStack({
      expectedItems: fn.inputs,
      lineNo: fn.lineNo,
      functionName: name,
    });

    // execute function
    this.program.functions[name].value.map(this.instruction);

    // verify outputs on top of stack
    this.verifyStack({
      expectedItems: fn.outputs,
      lineNo: fn.lineNo,
      functionName: name,
    });
  }

  public run(...args: AllowedValues[]): void {
    this.argumentsToStackValues(args);
    if ("main" in this.program.functions) {
      this.executeFunction("main");
    }
  }
}
