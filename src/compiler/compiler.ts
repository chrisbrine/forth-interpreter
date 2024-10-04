import {
  CompiledFunction,
  CompiledProgram,
  CompiledPrograms,
} from "@/types/compiled";
import { StackItemValue, StackItemValueType } from "@/types/compiledItemValue";
import {
  StackItem,
  StackItemConditional,
  StackItemFunction,
  StackItemType,
} from "@/types/compiledStackItem";
import { char, ValueType } from "@/types/compiledTypes";
import { ValueTypes } from "@/compiler/types";
import { CompileError } from "@/errors/compiler";
import { Variable } from "@/types/compiledVariable";
import {
  StackItemLoopDo,
  StackItemLoopFor,
  StackItemLoopForeach,
  StackItemLoopRepeat,
  StackItemLoopType,
  StackItemLoopUntil,
  StackItemLoopWhile,
} from "@/types/compiledLoopType";
import { Functions } from "@/compiler/functions";

interface CompilerProps {
  name?: string;
  depth?: number;
  internalFns?: Functions;
  code?: string | string[];
  compiledPrograms?: CompiledPrograms;
}

export class Compiler {
  private _compiledPrograms: CompiledPrograms = {};
  private compiled: CompiledProgram = {} as CompiledProgram;
  private _code: string[] = [];
  private _valueTypes: ValueTypes = new ValueTypes();
  private internalFns: Functions = new Functions();
  private inWideComment = false;
  private inBracketComment = false;
  private currentFunction: CompiledFunction = {} as CompiledFunction;
  private compiledFunctions: Record<string, CompiledFunction> = {};
  private inStackChain: StackItem[] = [];
  private inStackItem = false;
  private inVariable = false;
  private isConst = false;
  private inFunction = false;
  private inString = false;
  private quoteType = "";
  private lineNo = 0;
  private depth = 10;
  constructor(params?: CompilerProps) {
    this.handleParams(params);
  }
  public getProgram(): CompiledProgram {
    return this.compiled;
  }
  private handleParams(params?: CompilerProps) {
    const { name, depth, internalFns, code, compiledPrograms } = params || {};
    if (name) {
      this.compiled.name = name;
    }
    if (depth) {
      this.depth = depth;
    }
    if (internalFns) {
      this.internalFns = internalFns;
    }
    if (code) {
      this.code = code;
    }
    if (compiledPrograms) {
      this.compiledPrograms = compiledPrograms;
    }
  }
  public set compiledPrograms(compiledPrograms: CompiledPrograms) {
    this._compiledPrograms = compiledPrograms;
  }
  public get compiledPrograms(): CompiledPrograms {
    return this._compiledPrograms;
  }
  public set code(code: string[] | string) {
    if (Array.isArray(code)) {
      this._code = code;
    } else {
      this._code = code.split("\n");
    }
  }
  public get code(): string[] {
    return this._code;
  }
  private getValueType(type: string): ValueType {
    if (!this._valueTypes) {
      this._valueTypes = new ValueTypes({
        arrayDepth: this.depth / 2,
      });
    }
    return this._valueTypes.getByChar(type as char);
  }
  private reservedName(name: string) {
    // make sure it starts with an alphabetic character and doesn't contain any special characters but can have dashes and underscores and numbers after the first character */
    return !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name);
  }
  private createFunction(name: string, bracketString: string) {
    const value: StackItem[] = [];
    const inputs: ValueType[] = [];
    const outputs: ValueType[] = [];

    // check if function name exists
    if (this.compiled.functions[name]) {
      throw new CompileError({
        program: this.compiled.name,
        line: this.lineNo,
        message: `Function "${name}" already exists.`,
      });
    }

    if (this.reservedName(name)) {
      throw new CompileError({
        program: this.compiled.name,
        line: this.lineNo,
        message: `Function name "${name}" is not allowed.`,
      });
    }

    // need to verify if bracketString has ( i i -- s ) type format for arguments and results
    // if not, then ignore. Result is optional and whole thing is optional

    if (bracketString) {
      const items = bracketString.split(" ");
      let inInputs = true;
      for (const item of items) {
        if (item === "--") {
          inInputs = false;
          continue;
        }
        const type = item[0].toLowerCase();
        const valueType = this.getValueType(type);
        if (inInputs) {
          inputs.push(valueType);
        } else {
          outputs.push(valueType);
        }
      }
    }

    this.currentFunction = {
      name,
      value,
      variables: {},
      lineNo: this.lineNo,
      inputs,
      outputs,
    };
    this.inFunction = true;
    this.compiled.functions[name] = this.currentFunction;
  }
  private createVariable(name: string, variable: Variable) {
    if (this.reservedName(name)) {
      throw new CompileError({
        program: this.compiled.name,
        line: this.lineNo,
        message: `Variable name "${name}" is not allowed.`,
      });
    }
    if (this.inStackItem) {
      const stackItem = this.inStackChain[0];
      if ("variables" in stackItem) {
        stackItem.variables[name] = variable;
      }
      this.inVariable = false;
      return;
    }
    if (this.inFunction) {
      this.currentFunction.variables[name] = variable;
    } else {
      this.compiled.variables[name] = variable;
    }
    this.inVariable = false;
    // set to main program data
    this.compiled.stackVariables[variable.ref] =
      variable.item as StackItemValue;
    this.compiled.stackVariableData[variable.ref] = variable;
  }
  private variableExists(name: string) {
    if (this.inStackItem) {
      const stackItem = this.inStackChain[0];
      if ("variables" in stackItem && name in stackItem.variables) {
        return true;
      }
      return false;
    }
    if (this.inFunction) {
      if (name in this.currentFunction.variables) {
        return true;
      }
      return false;
    }
    if (name in this.compiled.variables) {
      return true;
    }
    return false;
  }
  private addItemToStack(item: StackItem) {
    if (this.inStackItem) {
      if (
        "inElse" in this.inStackChain[0] &&
        this.inStackChain[0].inElse &&
        "else" in this.inStackChain[0]
      ) {
        this.inStackChain[0].else.push(item);
      } else if ("value" in this.inStackChain[0]) {
        (this.inStackChain[0] as { value: StackItem[] }).value.push(item);
      }
    } else {
      this.currentFunction.value.push(item);
    }
  }
  private addExport(name: string) {
    if (this.inFunction) {
      this.currentFunction.name = name;
      this.compiled.functions[name] = this.currentFunction;
      this.inFunction = false;
    } else {
      this.compiled.exports.add(name);
    }
  }
  private addString(value: string) {
    if (this.inFunction) {
      if (value.length === 1) {
        this.currentFunction.value.push(
          this._valueTypes.toStackItemValue(StackItemValueType.char, {
            value,
            lineNo: this.lineNo,
          }),
        );
      } else {
        this.currentFunction.value.push(
          this._valueTypes.toStackItemValue(StackItemValueType.string, {
            value,
            lineNo: this.lineNo,
          }),
        );
      }
    } else {
      throw new CompileError({
        program: this.compiled.name,
        line: this.lineNo,
        message: "String was not closed.",
      });
    }
  }
  private handleFunctionItem(value: string) {
    const command = value.toLowerCase().trim();
    // check if a variable declaration
    if (command === "var") {
      this.inVariable = true;
      this.isConst = false;
      return;
    }
    // check if it is a const declaration
    if (command === "const") {
      this.inVariable = true;
      this.isConst = true;
      return;
    }
    // check if IF statement
    if (command === "if") {
      const ifStatement = {
        type: StackItemType.conditional,
        lineNo: this.lineNo,
        value: [],
        else: [],
        inElse: false,
        variables: {},
      } as StackItemConditional;
      this.addItemToStack(ifStatement);
      this.inStackChain.unshift(ifStatement);
      this.inStackItem = true;
      return;
    }
    // check if ELSE statement
    if (command === "else") {
      if (this.inStackChain[0].type !== StackItemType.conditional) {
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: "ELSE statement must be in an IF statement.",
        });
      }
      this.inStackChain[0].inElse = true;
      this.inStackItem = true;
      return;
    }
    // check the then statement for IF-ELSE-THEN
    if (command === "then") {
      if (this.inStackChain[0].type !== StackItemType.conditional) {
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: "THEN statement must be in an IF statement.",
        });
      }
      this.inStackChain.shift();
      this.inStackItem = this.inStackChain.length > 0;
      return;
    }
    // check for a FOR loop
    if (command === "for") {
      const forLoop = {
        type: StackItemType.loop,
        subType: StackItemLoopType.for,
        lineNo: this.lineNo,
        value: [],
        variables: {},
      } as StackItemLoopFor;
      this.addItemToStack(forLoop);
      this.inStackChain.unshift(forLoop);
      this.inStackItem = true;
      return;
    }
    // check for a FOREACH loop
    if (command === "foreach") {
      const foreachLoop = {
        type: StackItemType.loop,
        subType: StackItemLoopType.foreach,
        lineNo: this.lineNo,
        value: [],
        variables: {},
      } as StackItemLoopForeach;
      this.addItemToStack(foreachLoop);
      this.inStackChain.unshift(foreachLoop);
      this.inStackItem = true;
      return;
    }
    // check for a WHILE loop
    if (command === "while") {
      const whileLoop = {
        type: StackItemType.loop,
        subType: StackItemLoopType.while,
        lineNo: this.lineNo,
        value: [],
        variables: {},
      } as StackItemLoopWhile;
      this.addItemToStack(whileLoop);
      this.inStackChain.unshift(whileLoop);
      this.inStackItem = true;
      return;
    }
    // check for a DO loop
    if (command === "do" || command === "begin") {
      const doLoop = {
        type: StackItemType.loop,
        subType: StackItemLoopType.do,
        lineNo: this.lineNo,
        value: [],
        variables: {},
      } as StackItemLoopDo;
      this.addItemToStack(doLoop);
      this.inStackChain.unshift(doLoop);
      this.inStackItem = true;
      return;
    }
    // check for a REPEAT to close any loop type
    if (command === "repeat") {
      if (this.inStackChain.length === 0) {
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: "REPEAT statement must be in a loop.",
        });
      }
      const loopType = this.inStackChain.shift();
      if (!loopType || loopType.type !== StackItemType.loop) {
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: "REPEAT statement must be in a loop.",
        });
      }
      const repeatItem = {
        type: StackItemType.loop,
        subType: StackItemLoopType.repeat,
        lineNo: this.lineNo,
      } as StackItemLoopRepeat;
      if ("value" in loopType) {
        loopType.value.push(repeatItem);
      } else {
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: "REPEAT statement must be in a loop.",
        });
      }
      this.inStackItem = this.inStackChain.length > 0;
      return;
    }
    // check if the UNTIL statement to close a loop
    if (command === "until") {
      if (this.inStackChain.length === 0) {
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: "UNTIL statement must be in a loop.",
        });
      }
      const loopType = this.inStackChain.shift();
      if (!loopType || loopType.type !== StackItemType.loop) {
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: "UNTIL statement must be in a loop.",
        });
      }
      const untilItem = {
        type: StackItemType.loop,
        subType: StackItemLoopType.until,
        lineNo: this.lineNo,
      } as StackItemLoopUntil;
      if ("value" in loopType) {
        loopType.value.push(untilItem);
      } else {
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: "UNTIL statement must be in a loop.",
        });
      }
      this.inStackItem = this.inStackChain.length > 0;
      return;
    }
    // check if it is a reference. First character would be a '
    if (command[0] === "'") {
      // check if everything after the ' exists as a function
      const ref = command.slice(1);
      if (this.compiled.functions[ref]) {
        const newItem = this._valueTypes.toStackItemValue(
          StackItemValueType.ref,
          {
            value: ref,
            lineNo: this.lineNo,
          },
        );
        this.addItemToStack(newItem);
        return;
      } else {
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: `Function "${ref}" does not exist for ref.`,
        });
      }
    }
    // check if it is a number
    if (!isNaN(Number(value))) {
      const isFloat = value.includes(".");
      if (isFloat) {
        this.addItemToStack(
          this._valueTypes.toStackItemValue(StackItemValueType.float, {
            value: Number(value),
            lineNo: this.lineNo,
          }),
        );
      } else {
        this.addItemToStack(
          this._valueTypes.toStackItemValue(StackItemValueType.number, {
            value: Number(value),
            lineNo: this.lineNo,
          }),
        );
      }
      return;
    }
    // check if it is a boolean
    if (command === "true" || command === "false") {
      this.addItemToStack(
        this._valueTypes.toStackItemValue(StackItemValueType.boolean, {
          value: command === "true",
          lineNo: this.lineNo,
        }),
      );
      return;
    }
    // check if it is null
    if (command === "null") {
      this.addItemToStack(
        this._valueTypes.toStackItemValue(StackItemValueType.null, {
          lineNo: this.lineNo,
        }),
      );
      return;
    }
    // check if it is a function
    if (this.compiled.functions[command]) {
      this.addItemToStack({
        type: StackItemType.function,
        label: `Fn: ${command}`,
        lineNo: this.lineNo,
        value: command,
        stackFn: undefined,
      } as StackItemFunction);
      return;
    }
    // check if it is an internal function
    if (this.internalFns.exists(command)) {
      this.addItemToStack({
        type: StackItemType.function,
        label: `IFn: ${command}`,
        lineNo: this.lineNo,
        value: command,
        stackFn: this.internalFns.get(command),
      } as StackItemFunction);
      return;
    }
    // check if variable exists for name
    if (this.variableExists(command)) {
      this.addItemToStack(
        this._valueTypes.toStackItemValue(StackItemValueType.variable, {
          value: command,
          lineNo: this.lineNo,
        }),
      );
      return;
    }
  }
  private valueToStackItemAndValue(
    value: string,
  ): [StackItemValue | undefined, unknown | undefined] {
    /* If surrounded by quotation marks, then it is a string */
    /* If a number without a ., then it is a number */
    /* If a number with a ., then it is a float */
    /* If true or false when lowercase, then it is a boolean */
    /* If null at lowercase, then it is null */

    const command = value.toLowerCase().trim();
    // check if a number
    if (!isNaN(Number(value))) {
      const isFloat = value.includes(".");
      if (isFloat) {
        return [
          this._valueTypes.toStackItemValue(StackItemValueType.float, {
            value: Number(value),
            lineNo: this.lineNo,
          }),
          Number(value),
        ];
      } else {
        return [
          this._valueTypes.toStackItemValue(StackItemValueType.number, {
            value: Number(value),
            lineNo: this.lineNo,
          }),
          Number(value),
        ];
      }
    }
    // check if a boolean
    if (command === "true" || command === "false") {
      return [
        this._valueTypes.toStackItemValue(StackItemValueType.boolean, {
          value: command === "true",
          lineNo: this.lineNo,
        }),
        command === "true",
      ];
    }
    // check if null
    if (command === "null") {
      return [
        this._valueTypes.toStackItemValue(StackItemValueType.null, {
          lineNo: this.lineNo,
        }),
        null,
      ];
    }
    // check if string
    const finalIndex = value.length - 1;
    if (
      (finalIndex > 1 && value[0] === '"' && value[finalIndex] === '"') ||
      (value[0] === "'" && value[finalIndex] === "'") ||
      (value[0] === "`" && value[finalIndex] === "`")
    ) {
      // remove first and last character for string
      const newValue = value.slice(1, finalIndex - 1);
      if (newValue.length === 1) {
        return [
          this._valueTypes.toStackItemValue(StackItemValueType.char, {
            value: newValue,
            lineNo: this.lineNo,
          }),
          newValue,
        ];
      } else {
        return [
          this._valueTypes.toStackItemValue(StackItemValueType.string, {
            value: newValue,
            lineNo: this.lineNo,
          }),
          newValue,
        ];
      }
    }
    // not a valid type, return undefined for both
    return [undefined, undefined];
  }
  private handleVariable(name: string, value: string, bracketString: string) {
    if (name === "var" || name === "const") {
      // get first word of value and set it to name
      const items = value.split(" ");
      name = items.shift() || "";
      name = name.trim();
      // rest of the items in value are joined together for value
      value = items.join(" ");
    }
    if (!name) {
      throw new CompileError({
        program: this.compiled.name,
        line: this.lineNo,
        message: "Variable name must be provided.",
      });
    }
    if (this.variableExists(name)) {
      throw new CompileError({
        program: this.compiled.name,
        line: this.lineNo,
        message: `Variable "${name}" already exists.`,
      });
    }
    value = value.trim();
    if (value[0] === "=") {
      value = value.slice(1).trim();
    } else {
      value = "";
    }
    const [stackItem, initValue]: [
      StackItemValue | undefined,
      unknown | undefined,
    ] = value.trim()
      ? this.valueToStackItemAndValue(value)
      : [undefined, undefined];
    const typeItem = bracketString.trim();
    const valueType = this.getValueType(
      typeItem.length > 0 ? typeItem[0] : "?",
    );
    // create unique string ID for reference that is randomly unique
    const ref = `${name}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const variable: Variable = {
      type: valueType,
      initValue: initValue,
      constant: this.isConst,
      item: stackItem,
      ref,
    };
    this.createVariable(name, variable);
  }
  private runLine(
    functionName: string,
    restOfString: string,
    bracketString: string,
  ) {
    if (!functionName) {
      return;
    }
    switch (functionName.toLowerCase()) {
      case "program": // Name of program
        this.compiled.name = restOfString;
        break;
      case ":": // Function declaration
        {
          const items = restOfString.split(" ");
          if (items.length > 1) {
            throw new CompileError({
              program: this.compiled.name,
              line: this.lineNo,
              message: "Function name must be one word.",
            });
          }
          this.createFunction(items[0], bracketString);
        }
        break;
      case "public": // export declaration followed by function name
        this.addExport(restOfString);
        break;
      case "const": // constant declaration
        this.inVariable = true;
        this.isConst = true;
        this.handleVariable(functionName, restOfString, bracketString);
        break;
      case "var": // variable declaration
        this.inVariable = true;
        this.isConst = false;
        this.handleVariable(functionName, restOfString, bracketString);
        break;
      case "$include": // include another file
        // to do
        break;
      default: // doesn't exist, so crash
        throw new CompileError({
          program: this.compiled.name,
          line: this.lineNo,
          message: `Base program option "${functionName}" does not exist.`,
        });
    }
  }
  private handleBaseLine(line: string) {
    let currentOption = "";
    let fullMatch = "";
    let restOfString = "";
    let addingToOption = true;
    let bracketString = "";
    this.inVariable = false;
    this.isConst = false;
    for (const char of line) {
      if ((char === " " || char === "\t") && currentOption === "") {
        continue;
      }
      fullMatch += char;
      if (
        (char === "#" || fullMatch.endsWith("//")) &&
        !this.inWideComment &&
        !this.inBracketComment &&
        !this.inString
      ) {
        if (char !== "#") {
          if (addingToOption) {
            currentOption = currentOption.slice(0, -1);
          } else {
            restOfString = restOfString.slice(0, -1);
          }
        }
        break;
      }
      if (fullMatch.endsWith("/*") && !this.inWideComment && !this.inString) {
        if (addingToOption) {
          currentOption = currentOption.slice(0, -1);
        } else {
          restOfString = restOfString.slice(0, -1);
        }
        this.inWideComment = true;
      } else if (fullMatch === "*/" && this.inWideComment && !this.inString) {
        this.inWideComment = false;
      } else if (this.inWideComment) {
        continue;
      } else if (char === "(" && !this.inString) {
        this.inBracketComment = true;
        bracketString = "";
      } else if (char === ")" && this.inBracketComment && !this.inString) {
        this.inBracketComment = false;
      } else if (this.inBracketComment) {
        bracketString += char;
        continue;
      } else if (!this.inFunction) {
        if (char === " " && addingToOption) {
          addingToOption = false;
          continue;
        } else if (addingToOption) {
          currentOption += char;
        } else {
          restOfString += char;
        }
      } else if (char === ";" && !this.inString) {
        // ending function
        if (this.inStackItem) {
          throw new CompileError({
            program: this.compiled.name,
            line: this.lineNo,
            message: "Stack item was not closed.",
          });
        }
        if (this.inVariable) {
          throw new CompileError({
            program: this.compiled.name,
            line: this.lineNo,
            message:
              "Variable cannot be declared on the same line as closing the function.",
          });
        }
        this.inFunction = false;
        if (currentOption) {
          this.handleFunctionItem(currentOption);
        }
        currentOption = "";
        restOfString = "";
        bracketString = "";
      } else if (
        char === '"' &&
        // (char === '"' || char === "'" || char === "`") &&
        !this.inWideComment &&
        !this.inBracketComment
      ) {
        if (!this.inString) {
          if (currentOption) {
            this.handleFunctionItem(currentOption);
          }
          currentOption = "";
          restOfString = "";
          bracketString = "";
          this.inString = true;
          this.quoteType = char;
        } else {
          this.addString(currentOption);
          currentOption = "";
        }
      } else if (this.inString) {
        currentOption += char;
      } else if (
        char === " " &&
        !this.inString &&
        !this.inWideComment &&
        !this.inBracketComment
      ) {
        if (currentOption && !this.inVariable) {
          this.handleFunctionItem(currentOption);
        }
        currentOption = "";
        restOfString = "";
        bracketString = "";
      }
    }
    if (this.inString) {
      throw new CompileError({
        program: this.compiled.name,
        line: this.lineNo,
        message: "String was not closed.",
      });
    }
    if (this.inVariable) {
      this.handleVariable(currentOption, restOfString, bracketString);
    }
    if (!this.inFunction) {
      this.runLine(currentOption, restOfString, bracketString);
    }
  }
  public compile(params?: {
    name: string;
    depth: number;
    internalFns: Functions;
    code: string | string[];
  }) {
    this.handleParams(params);
    const name = this.compiled.name;
    this.compiled = {
      name: name || "",
      variables: {},
      exports: new Set<string>(),
      functions: {},
      stackVariableData: {},
      stackVariables: {},
    };
    for (let lineNo = 0; lineNo < this.code.length; lineNo++) {
      this.lineNo = lineNo;
      this.handleBaseLine(this.code[lineNo]);
    }
  }
}
