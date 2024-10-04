import { CompileError } from "@/errors/compiler";
import {
  StackItemValue,
  StackItemValueArray,
  StackItemValueBoolean,
  StackItemValueChar,
  StackItemValueDictionary,
  StackItemValueFloat,
  StackItemValueNull,
  StackItemValueNumber,
  StackItemValueRef,
  StackItemValueString,
  StackItemValueType,
  StackItemValueVariable,
} from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";
import { char, ValueType, ValueTypeOther } from "@/types/compiledTypes";

const currentTypes: ValueType[] = [
  {
    type: StackItemValueType.number,
    label: (item: StackItemValue) =>
      (item as StackItemValueNumber).value.toString(),
    verify: (item: StackItemValue) =>
      typeof (item as StackItemValueNumber).value === "number",
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueNumber;
    },
    char: "i" as char,
  },
  {
    type: StackItemValueType.string,
    label: (item: StackItemValue) =>
      `"${(item as StackItemValueString).value}"`,
    verify: (item: StackItemValue) =>
      typeof (item as StackItemValueString).value === "string",
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueString;
    },
    char: "s" as char,
  },
  {
    type: StackItemValueType.boolean,
    label: (item: StackItemValue) =>
      `${(item as StackItemValueBoolean).value} ? 'TRUE' : 'FALSE'`,
    verify: (item: StackItemValue) =>
      typeof (item as StackItemValueBoolean).value === "boolean",
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueBoolean;
    },
    char: "b" as char,
  },
  {
    type: StackItemValueType.float,
    label: (item: StackItemValue) =>
      (item as StackItemValueFloat).value.toString(),
    verify: (item: StackItemValue) =>
      typeof (item as StackItemValueFloat).value === "number" &&
      !Number.isInteger((item as StackItemValueFloat).value),
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueFloat;
    },
    char: "f" as char,
  },
  {
    type: StackItemValueType.char,
    label: (item: StackItemValue) => `'${(item as StackItemValueChar).value}'`,
    verify: (item: StackItemValue) =>
      typeof (item as StackItemValueChar).value === "string" &&
      (item as StackItemValueChar).value.length === 1,
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueChar;
    },
    char: "c" as char,
  },
  {
    type: StackItemValueType.null,
    label: () => "NULL",
    verify: (item: StackItemValue) =>
      ((item as StackItemValue).type as string) === StackItemValueType.null,
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueNull;
    },
    char: "-" as char,
  },
  {
    type: StackItemValueType.array,
    label: (
      item: StackItemValue,
      obj: ValueTypes,
      data: Record<string, unknown>,
    ) => {
      const depth = ((data.depth as number) || 0) + 1;
      const arrayDepth = (data.arrayDepth as number) || 20;
      const count = Math.floor(arrayDepth / depth);
      const itemsToLabel = (item as StackItemValueArray).value.slice(
        (item as StackItemValueArray).value.length - count - 1,
      );
      return `[ ${itemsToLabel
        .map((i) => obj.getByType(i.subType).label(i, obj, { ...data, depth }))
        .join(", ")} ]`;
    },
    verify: (item: StackItemValue) =>
      Array.isArray((item as StackItemValueArray).value),
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueArray;
    },
    char: "a" as char,
  },
  {
    type: StackItemValueType.dictionary,
    label: (
      item: StackItemValue,
      obj: ValueTypes,
      data: Record<string, unknown>,
    ) => {
      const depth = ((data.depth as number) || 0) + 1;
      const arrayDepth = (data.arrayDepth as number) || 20;
      const count = Math.floor(arrayDepth / depth);
      const keys = Object.keys((item as StackItemValueDictionary).value);
      const itemsToLabel = keys.slice(keys.length - count - 1);
      return `{ ${itemsToLabel
        .map((key) => {
          const value = (item as StackItemValueDictionary).value[key];
          return `${key}: ${obj
            .getByType(value.subType)
            .label(value, obj, { ...data, depth })}`;
        })
        .join(", ")} }`;
    },
    verify: (item: StackItemValue) =>
      typeof (item as StackItemValueDictionary).value === "object",
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueDictionary;
    },
    char: "o" as char,
  },
  {
    type: StackItemValueType.variable,
    label: (item: StackItemValue) =>
      `VAR: ${(item as StackItemValueVariable).value}`,
    verify: (item: StackItemValue) =>
      "value" in (item as StackItemValue) &&
      typeof (item as StackItemValueVariable).value === "string",
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueVariable;
    },
    char: "@" as char,
  },
  {
    type: StackItemValueType.ref,
    label: (item: StackItemValue) =>
      `REF: ${(item as StackItemValueRef).value}`,
    verify: (item: StackItemValue) =>
      "value" in (item as StackItemValue) &&
      typeof (item as StackItemValueRef).value === "string",
    create: (
      type: StackItemValueType,
      data: Record<string, unknown> & { lineNo: number; value?: unknown },
      obj: ValueTypes,
    ): StackItemValue => {
      const item = obj.baseType(type, data.lineNo, data.value);
      item.label = obj.getLabel(item);
      return item as StackItemValueRef;
    },
    char: "!" as char,
  },
];

function addOtherType(
  name: string,
  char: char,
  label: (item: StackItemValue, obj: ValueTypes) => string,
  verify: (item: StackItemValue) => boolean,
  create: (
    type: StackItemValueType,
    data: Record<string, unknown> & { lineNo: number; value?: unknown },
    obj: ValueTypes,
  ) => StackItemValue,
) {
  if (char === "?" || currentTypes.some((type) => type.char === char)) {
    throw new CompileError({ message: `Char already in use: ${char}` });
  }
  currentTypes.push({
    type: StackItemValueType.other,
    label,
    verify,
    char,
    create,
    name,
  });
}

function removeOtherType(name: string) {
  const index = currentTypes.findIndex(
    (type) =>
      type.type === StackItemValueType.other &&
      (type as ValueTypeOther).name === name,
  );
  if (index !== -1) {
    currentTypes.splice(index, 1);
  }
}

export const otherTypes = () => ({
  add: addOtherType,
  remove: removeOtherType,
});

export class ValueTypes {
  private typesByChar: Record<char, ValueType> = {};
  private typesByType: Record<string, ValueType> = {};
  private arrayDepth: number;

  constructor(params?: { arrayDepth: number }) {
    const { arrayDepth } = params || {};
    this.arrayDepth = arrayDepth || 20;
    for (const type of currentTypes) {
      this.typesByChar[type.char] = type;
      this.typesByType[type.type] = type;
    }
  }

  public getLabel(item: StackItemValue) {
    const data = { depth: 0, arrayDepth: this.arrayDepth };
    return this.getByType(item.subType).label(item, this, data);
  }

  public getByChar(char: char): ValueType {
    if (!this.typesByChar[char]) {
      throw new CompileError({ message: `Unknown type char: ${char}` });
    }
    return this.typesByChar[char];
  }

  public getByType(type: StackItemValueType): ValueType {
    if (!this.typesByType[type]) {
      throw new CompileError({ message: `Unknown type: ${type}` });
    }
    return this.typesByType[type];
  }

  public toStackItemValue(
    type: StackItemValueType,
    data: Record<string, unknown> & { lineNo: number; value?: unknown },
  ): StackItemValue {
    return this.getByType(type).create(type, data, this);
  }

  public baseType(
    type: StackItemValueType,
    lineNo: number,
    value?: unknown,
  ): StackItemValue & { subType: StackItemValueType; value?: unknown } {
    return {
      type: StackItemType.value,
      subType: type as StackItemValueType,
      value,
      lineNo,
    } as StackItemValue;
  }
}
