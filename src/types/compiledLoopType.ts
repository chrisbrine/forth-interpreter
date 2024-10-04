import {
  StackItem,
  StackItemBase,
  StackItemType,
} from "@/types/compiledStackItem";
import { Variables } from "@/types/compiledVariable";

export enum StackItemLoopType {
  while = "while",
  for = "for",
  foreach = "foreach",
  do = "do",
  repeat = "repeat",
  until = "until",
  break = "break",
  continue = "continue",
}

export interface StackItemLoopBase extends StackItemBase {
  type: StackItemType.loop;
}

export interface StackItemLoopInit extends StackItemLoopBase {
  variables: Variables;
  value: StackItem[];
}

export interface StackItemLoopWhile extends StackItemLoopInit {
  subType: StackItemLoopType.while;
}

export interface StackItemLoopFor extends StackItemLoopInit {
  subType: StackItemLoopType.for;
}

export interface StackItemLoopForeach extends StackItemLoopInit {
  subType: StackItemLoopType.foreach;
}

export interface StackItemLoopDo extends StackItemLoopInit {
  subType: StackItemLoopType.do;
}

export interface StackItemLoopRepeat extends StackItemLoopBase {
  subType: StackItemLoopType.repeat;
}

export interface StackItemLoopUntil extends StackItemLoopBase {
  subType: StackItemLoopType.until;
}

export interface StackItemLoopBreak extends StackItemLoopBase {
  subType: StackItemLoopType.break;
}

export interface StackItemLoopContinue extends StackItemLoopBase {
  subType: StackItemLoopType.continue;
}

export type StackItemLoop =
  | StackItemLoopWhile
  | StackItemLoopFor
  | StackItemLoopForeach
  | StackItemLoopDo
  | StackItemLoopRepeat
  | StackItemLoopUntil
  | StackItemLoopBreak
  | StackItemLoopContinue;
