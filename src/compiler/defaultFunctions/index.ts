import { Functions } from "@/compiler/functions";
import { arrayFns } from "./arrays";
import { bitwiseFns } from "./bitwise";
import { conditionalFns } from "./conditional";
import { operatorFns } from "./operators";
import { refFns } from "./ref";
import { stackFns } from "./stack";
import { stringFns } from "./string";
import { timeFns } from "./time";
import { typesFns } from "./types";
import { variableFns } from "./variables";
import { StackFn } from "@/types/stack";

export const addFns = (items: [string, StackFn][]) => {
  items.map(([name, fn]) => Functions.registerGlobal(name, fn));
};

export const addAllDefaultFns = () => {
  [
    arrayFns,
    bitwiseFns,
    conditionalFns,
    operatorFns,
    refFns,
    stackFns,
    stringFns,
    timeFns,
    typesFns,
    variableFns,
  ].map((fns) => addFns(fns));
};
