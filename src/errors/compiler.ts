interface MessageProps {
  name?: string;
  program?: string;
  fn?: string;
  line?: number;
  message?: string;
}

type CompileErrorProps = MessageProps;

export class CompileError extends Error {
  private unknownError = "An unknown error occurred.";

  private addToMessage(msg: string, addString: string, separator: string) {
    if (msg) {
      msg += separator;
    }
    msg += addString;
    return msg;
  }

  private createMessage = ({
    name,
    program,
    fn,
    line,
    message,
  }: MessageProps): string => {
    let msg = "";
    if (program) {
      if (fn) {
        msg = this.addToMessage(msg, `[${program}:${fn}]`, " ");
      } else {
        msg = this.addToMessage(msg, `[${program}]`, " ");
      }
    } else if (fn) {
      msg = this.addToMessage(msg, `[${fn}]`, " ");
    }
    if (name) {
      msg = this.addToMessage(msg, `{${name}}`, " ");
    }
    if (line) {
      msg = this.addToMessage(msg, `#${line}`, " ");
    }
    if (message) {
      msg = this.addToMessage(msg, message, ": ");
    }
    return msg;
  };

  constructor({ name, program, fn, line, message }: CompileErrorProps) {
    super("");
    this.message = this.createMessage({
      name,
      program,
      fn,
      line,
      message: message || this.unknownError,
    });
    this.name = "CompileError";
  }
}
