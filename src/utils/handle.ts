import {
  StackItemValue,
  StackItemValueArray,
  StackItemValueBoolean,
  StackItemValueDictionary,
  StackItemValueFloat,
  StackItemValueNumber,
  StackItemValueString,
  StackItemValueType,
} from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";

export const getTruthiness = (item: StackItemValue): boolean => {
  switch (item.type) {
    case StackItemType.value:
      switch (item.subType) {
        case StackItemValueType.number:
          return (item as StackItemValueNumber).value !== 0;
        case StackItemValueType.float:
          return (item as StackItemValueFloat).value !== 0;
        case StackItemValueType.string:
          return (item as StackItemValueString).value.length > 0;
        case StackItemValueType.boolean:
          return (item as StackItemValueBoolean).value;
        case StackItemValueType.array:
          return (item as StackItemValueArray).value.length > 0;
        case StackItemValueType.dictionary:
          return (
            Object.keys((item as StackItemValueDictionary).value).length > 0
          );
      }
  }
  return false;
};
