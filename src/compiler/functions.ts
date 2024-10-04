import { StackFn } from "@/types/stack";
import { addAllDefaultFns } from "./defaultFunctions";

export class Functions {
  private static global: Record<string, StackFn> = {};
  private local: Record<string, StackFn> = {};

  constructor() {
    if (!this.hasSet()) {
      this.defaults();
    }
  }

  public static registerGlobal(name: string, fn: StackFn) {
    if (Functions.global[name]) {
      throw new Error(`Function ${name} already exists`);
    }
    Functions.global[name] = fn;
  }

  public register(name: string, fn: StackFn) {
    if (this.local[name]) {
      throw new Error(`Function ${name} already exists`);
    }
    this.local[name] = fn;
  }

  public exists(name: string): boolean {
    return !!this.get(name);
  }

  public get(name: string): StackFn {
    return this.local[name] || Functions.global[name];
  }

  private hasSet(): boolean {
    return Object.keys(this.local).length > 0;
  }

  private defaults() {
    addAllDefaultFns();
  }
}
