import { Compiler } from "@/compiler/compiler";
import { Functions } from "@/compiler/functions";
import { CompileError } from "@/errors/compiler";
import { Interpreter } from "@/interpreter/interpreter";

interface ProgramProps {
  id?: string;
  name?: string;
  internalFns?: Functions;
  code?: string | string[];
}

type AllowedValues = number | string | boolean | null;

export class Program {
  private id = "";
  private name = "";
  private internalFns = new Functions();
  private code: string | string[] = [];
  private compiled: Compiler | null = null;
  constructor(props?: ProgramProps) {
    this.handleProps(props || {});
  }
  handleProps(props: ProgramProps) {
    if (props.id) {
      this.id = props.id;
    }
    if (props.name) {
      this.name = props.name;
    }
    if (props.internalFns) {
      this.internalFns = props.internalFns;
    }
    if (props.code) {
      this.code = props.code;
    }
  }
  compile(props?: ProgramProps) {
    if (props) {
      this.handleProps(props);
    }
    try {
      const compiler = new Compiler({
        name: this.name,
        internalFns: this.internalFns,
        code: this.code,
      });
      compiler.compile();
      this.compiled = compiler;
    } catch (e) {
      if (e instanceof CompileError) {
        throw e;
      } else {
        console.log("UNCAUGHT INTERNAL ERROR");
        throw e;
      }
    }
  }
  run(...args: AllowedValues[]) {
    if (!this.compiled) {
      this.compile();
    }
    if (!this.compiled) {
      throw new Error("Unable to compile program");
    }
    const interpreter = new Interpreter(this.compiled.getProgram());
    interpreter.run(...args);
  }
}
