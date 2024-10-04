import { CompileError } from "@/errors/compiler";
import {
  StackItemValue,
  StackItemValueArray,
  StackItemValueDictionary,
  StackItemValueDictionaryValue,
  StackItemValueNumber,
  StackItemValueString,
  StackItemValueType,
} from "@/types/compiledItemValue";
import { StackItemType } from "@/types/compiledStackItem";
import { StackFn } from "@/types/stack";

export const arrayFns: [string, StackFn][] = [
  [
    "array_count",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (
          !array ||
          array.type !== StackItemType.value ||
          (array.subType !== StackItemValueType.array &&
            array.subType !== StackItemValueType.dictionary)
        ) {
          throw new CompileError({
            name,
            message: "Not a proper array on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        const newItem = valueTypes.toStackItemValue(StackItemValueType.number, {
          value: array.value.length,
          lineNo,
        });
        stack.push(newItem);
      },
  ],
  [
    "array_delitem",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        const index = stack.pop() as
          | StackItemValueNumber
          | StackItemValueString
          | undefined;
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (
          !array ||
          (array.subType !== StackItemValueType.dictionary &&
            array.subType !== StackItemValueType.array)
        ) {
          throw new CompileError({
            name,
            message: "Not a proper array or dictionary on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (array.subType === StackItemValueType.dictionary) {
          if (
            !index ||
            !array ||
            index.type !== StackItemType.value ||
            array.type !== StackItemType.value ||
            (index.subType !== StackItemValueType.number &&
              index.subType !== StackItemValueType.string) ||
            array.subType !== StackItemValueType.dictionary
          ) {
            throw new CompileError({
              name,
              message: "Not a proper dictionary on top of the stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          if (!(index.value in array.value)) {
            throw new CompileError({
              name,
              message: "Index not in dictionary.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          const item = array.value[index.value];
          const duplicateItem = JSON.parse(JSON.stringify(item));
          stack.push(duplicateItem);
        } else {
          if (
            !index ||
            !array ||
            index.type !== StackItemType.value ||
            array.type !== StackItemType.value ||
            index.subType !== StackItemValueType.number ||
            array.subType !== StackItemValueType.array
          ) {
            throw new CompileError({
              name,
              message: "Not a proper array on top of the stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          if (index.value < 0 || index.value >= array.value.length) {
            throw new CompileError({
              name,
              message: "Index out of bounds.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          const item = array.value[index.value];
          const duplicateItem = JSON.parse(JSON.stringify(item));
          stack.push(duplicateItem);
        }
      },
  ],
  [
    "array_delrange",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        const end = stack.pop() as
          | StackItemValueNumber
          | StackItemValueString
          | undefined;
        const start = stack.pop() as
          | StackItemValueNumber
          | StackItemValueString
          | undefined;
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (array && array.subType === StackItemValueType.dictionary) {
          if (
            !end ||
            !start ||
            !array ||
            end.type !== StackItemType.value ||
            start.type !== StackItemType.value ||
            array.type !== StackItemType.value ||
            (end.subType !== StackItemValueType.number &&
              end.subType !== StackItemValueType.string) ||
            (start.subType !== StackItemValueType.number &&
              start.subType !== StackItemValueType.string) ||
            array.subType !== StackItemValueType.dictionary
          ) {
            throw new CompileError({
              name,
              message: "Not a proper dictionary on top of the stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          const keys = Object.keys(array.value);
          // find start.value index
          const startKey = keys.indexOf(start.value.toString());
          const endKey = keys.indexOf(end.value.toString());
          const delKeys = keys.slice(startKey, endKey + 1);
          for (const key in delKeys) {
            Reflect.deleteProperty(array.value, key);
          }
          stack.push(array);
        } else {
          if (
            !end ||
            !start ||
            !array ||
            end.type !== StackItemType.value ||
            start.type !== StackItemType.value ||
            array.type !== StackItemType.value ||
            end.subType !== StackItemValueType.number ||
            start.subType !== StackItemValueType.number ||
            array.subType !== StackItemValueType.array
          ) {
            throw new CompileError({
              name,
              message: "Not a proper array on top of the stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          array.value.splice(start.value, end.value - start.value + 1);
          stack.push(array);
        }
      },
  ],
  [
    "array_first",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (
          !array ||
          (array.subType !== StackItemValueType.dictionary &&
            array.subType !== StackItemValueType.array)
        ) {
          throw new CompileError({
            name,
            message: "Not a proper array or dictionary on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (
          !array ||
          array.type !== StackItemType.value ||
          (array.subType !== StackItemValueType.array &&
            array.subType !== StackItemValueType.dictionary)
        ) {
          throw new CompileError({
            name,
            message: "Not a proper array or dictionary on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (array.value.length === 0 || Object.keys(array.value).length === 0) {
          const newItem = valueTypes.toStackItemValue(
            StackItemValueType.boolean,
            {
              value: false,
              lineNo,
            },
          );
          stack.push(newItem);
        } else {
          if (array.subType === StackItemValueType.dictionary) {
            const keys = Object.keys(array.value);
            const key = keys[0];
            const newItem = valueTypes.toStackItemValue(
              StackItemValueType.string,
              {
                value: key,
                lineNo,
              },
            );
            stack.push(newItem);
            stack.push(JSON.parse(JSON.stringify(array.value[key])));
          } else {
            stack.push(JSON.parse(JSON.stringify(array.value[0])));
          }
          const newItem = valueTypes.toStackItemValue(
            StackItemValueType.boolean,
            {
              value: true,
              lineNo,
            },
          );
          stack.push(newItem);
        }
      },
  ],
  [
    "array_explode",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        // this will take an array and move all values and the total count to the stack
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (
          !array ||
          array.type !== StackItemType.value ||
          (array.subType !== StackItemValueType.array &&
            array.subType !== StackItemValueType.dictionary)
        ) {
          throw new CompileError({
            name,
            message: "Not a proper array or dictionary on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (array.subType === StackItemValueType.dictionary) {
          const keys = Object.keys(array.value);
          keys.forEach((key) => {
            const newKeyItem = valueTypes.toStackItemValue(
              StackItemValueType.string,
              {
                value: key,
                lineNo,
              },
            );
            stack.push(newKeyItem);
            stack.push(array.value[key]);
          });
          const newItem = valueTypes.toStackItemValue(
            StackItemValueType.number,
            {
              value: keys.length,
              lineNo,
            },
          );
          stack.push(newItem);
        } else {
          array.value.forEach((item, index) => {
            const newItem = valueTypes.toStackItemValue(
              StackItemValueType.number,
              {
                value: index,
                lineNo,
              },
            );
            stack.push(newItem);
            stack.push(item);
          });
          const newItem = valueTypes.toStackItemValue(
            StackItemValueType.number,
            {
              value: array.value.length,
              lineNo,
            },
          );
          stack.push(newItem);
        }
      },
  ],
  [
    "array_getitem",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        const index = stack.pop() as
          | StackItemValueNumber
          | StackItemValueString
          | undefined;
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (
          !index ||
          !array ||
          index.type !== StackItemType.value ||
          array.type !== StackItemType.value ||
          (index.subType !== StackItemValueType.number &&
            index.subType !== StackItemValueType.string) ||
          (array.subType !== StackItemValueType.array &&
            array.subType !== StackItemValueType.dictionary)
        ) {
          throw new CompileError({
            name,
            message:
              "Not a proper array or dictionary on top of the stack or not enough items on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (array.subType === StackItemValueType.dictionary) {
          if (!(index.value in array.value)) {
            throw new CompileError({
              name,
              message: "Index not in dictionary.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          const item = array.value[index.value.toString()];
          const duplicateItem = JSON.parse(JSON.stringify(item));
          stack.push(duplicateItem);
        } else {
          if (
            index.subType === StackItemValueType.string ||
            index.value < 0 ||
            index.value >= array.value.length
          ) {
            throw new CompileError({
              name,
              message: "Index out of bounds.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          const item = array.value[index.value];
          const duplicateItem = JSON.parse(JSON.stringify(item));
          stack.push(duplicateItem);
        }
      },
  ],
  [
    "array_getrange",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const end = stack.pop() as
          | StackItemValueNumber
          | StackItemValueString
          | undefined;
        const start = stack.pop() as
          | StackItemValueNumber
          | StackItemValueString
          | undefined;
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (array && array.subType === StackItemValueType.dictionary) {
          if (
            !end ||
            !start ||
            !array ||
            end.type !== StackItemType.value ||
            start.type !== StackItemType.value ||
            array.type !== StackItemType.value ||
            (end.subType !== StackItemValueType.number &&
              end.subType !== StackItemValueType.string) ||
            (start.subType !== StackItemValueType.number &&
              start.subType !== StackItemValueType.string) ||
            array.subType !== StackItemValueType.dictionary
          ) {
            throw new CompileError({
              name,
              message: "Not a proper dictionary on top of the stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          const keys = Object.keys(array.value);
          const startKey = keys.indexOf(start.value.toString());
          const endKey = keys.indexOf(end.value.toString());
          const rangeKeys = keys.slice(startKey, endKey + 1);
          const range: StackItemValueDictionaryValue = {};
          rangeKeys.forEach((key) => {
            range[key] = array.value[key];
          });
          const newItem = valueTypes.toStackItemValue(
            StackItemValueType.dictionary,
            {
              value: range,
              lineNo,
            },
          );
          stack.push(newItem);
        } else {
          if (
            !end ||
            !start ||
            !array ||
            end.type !== StackItemType.value ||
            start.type !== StackItemType.value ||
            array.type !== StackItemType.value ||
            end.subType !== StackItemValueType.number ||
            start.subType !== StackItemValueType.number ||
            array.subType !== StackItemValueType.array
          ) {
            throw new CompileError({
              name,
              message: "Not a proper array on top of the stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          const range = array.value.slice(start.value, end.value + 1);
          const newItem = valueTypes.toStackItemValue(
            StackItemValueType.array,
            {
              value: range,
              lineNo,
            },
          );
          stack.push(newItem);
        }
      },
  ],
  [
    "array_insertitem",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        const index = stack.pop() as
          | StackItemValueNumber
          | StackItemValueString
          | undefined;
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        const value = stack.pop() as StackItemValue | undefined;
        if (
          !index ||
          !array ||
          !value ||
          index.type !== StackItemType.value ||
          array.type !== StackItemType.value ||
          value.type !== StackItemType.value ||
          (index.subType !== StackItemValueType.number &&
            index.subType !== StackItemValueType.string) ||
          (array.subType !== StackItemValueType.array &&
            array.subType !== StackItemValueType.dictionary)
        ) {
          throw new CompileError({
            name,
            message:
              "Not a proper array or dictionary on top of the stack or not enough items on the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (array.subType === StackItemValueType.dictionary) {
          if (!(index.value in array.value)) {
            throw new CompileError({
              name,
              message: "Index not in dictionary.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          array.value[index.value.toString()] = value;
          stack.push(array);
        } else {
          if (
            index.subType !== StackItemValueType.number ||
            index.value < 0 ||
            index.value > array.value.length
          ) {
            throw new CompileError({
              name,
              message: "Index out of bounds.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          array.value.splice(index.value, 0, value);
          stack.push(array);
        }
      },
  ],
  [
    "array_insertrange",
    ({ name, programName, functionName, lineNo }) =>
      (stack) => {
        // Inserts items from array a2 into a1, starting at the given index. Returns the resulting array.
        // ( a1 @ a2 -- a' )
        const array2 = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        const index = stack.pop() as
          | StackItemValueNumber
          | StackItemValueString
          | undefined;
        const array1 = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (
          !array2 ||
          !index ||
          !array1 ||
          array2.type !== StackItemType.value ||
          index.type !== StackItemType.value ||
          array1.type !== StackItemType.value ||
          (array2.subType !== StackItemValueType.array &&
            array2.subType !== StackItemValueType.dictionary) ||
          (index.subType !== StackItemValueType.number &&
            index.subType !== StackItemValueType.string) ||
          (array1.subType !== StackItemValueType.array &&
            array1.subType !== StackItemValueType.dictionary)
        ) {
          throw new CompileError({
            name,
            message:
              "Not a proper array or dictionary on top of the stack or not enough items in the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (
          array1.subType === StackItemValueType.dictionary &&
          array2.subType === StackItemValueType.dictionary
        ) {
          const keys = Object.keys(array2.value);
          keys.map((key) => {
            array1.value[key] = array2.value[key];
          });
          stack.push(array1);
        } else if (
          array1.subType === StackItemValueType.array &&
          array2.subType === StackItemValueType.array
        ) {
          if (index.subType !== StackItemValueType.number) {
            throw new CompileError({
              name,
              message: "Index is not a number.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          array1.value.splice(index.value, 0, ...array2.value);
          stack.push(array1);
        } else {
          // throw error
          throw new CompileError({
            name,
            message:
              "Both items must either be an array or dictionary not both.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
      },
  ],
  [
    "array_keys",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (
          !array ||
          array.type !== StackItemType.value ||
          (array.subType !== StackItemValueType.array &&
            array.subType !== StackItemValueType.dictionary)
        ) {
          throw new CompileError({
            name,
            message: "Not a proper array or dictionary on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (array.subType === StackItemValueType.dictionary) {
          const keys = Object.keys(array.value);
          const newKeys = keys.map((key) => {
            return valueTypes.toStackItemValue(StackItemValueType.string, {
              value: key,
              lineNo,
            });
          });
          const newItem = valueTypes.toStackItemValue(
            StackItemValueType.array,
            {
              value: newKeys,
              lineNo,
            },
          );
          stack.push(newItem);
        } else {
          const keys = array.value.map((_, i) => i);
          const newItem = valueTypes.toStackItemValue(
            StackItemValueType.array,
            {
              value: keys.map((key) => {
                return valueTypes.toStackItemValue(StackItemValueType.number, {
                  value: key,
                  lineNo,
                });
              }),
              lineNo,
            },
          );
          stack.push(newItem);
        }
      },
  ],
  [
    "array_last",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const array = stack.pop() as
          | StackItemValueArray
          | StackItemValueDictionary
          | undefined;
        if (
          !array ||
          array.type !== StackItemType.value ||
          (array.subType !== StackItemValueType.array &&
            array.subType !== StackItemValueType.dictionary)
        ) {
          throw new CompileError({
            name,
            message: "Not a proper array or dictionary on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        if (array.subType === StackItemValueType.dictionary) {
          const keys = Object.keys(array.value);
          if (keys.length === 0) {
            const newItem = valueTypes.toStackItemValue(
              StackItemValueType.boolean,
              {
                value: false,
                lineNo,
              },
            );
            stack.push(newItem);
          } else {
            const key = keys[keys.length - 1];
            const newItem = valueTypes.toStackItemValue(
              StackItemValueType.string,
              {
                value: key,
                lineNo,
              },
            );
            stack.push(JSON.parse(JSON.stringify(array.value[key])));
            stack.push(newItem);
          }
        } else {
          if (array.value.length === 0) {
            const newItem = valueTypes.toStackItemValue(
              StackItemValueType.boolean,
              {
                value: false,
                lineNo,
              },
            );
            stack.push(newItem);
          } else {
            stack.push(
              JSON.parse(JSON.stringify(array.value[array.value.length - 1])),
            );
            const newItem = valueTypes.toStackItemValue(
              StackItemValueType.boolean,
              {
                value: true,
                lineNo,
              },
            );
            stack.push(newItem);
          }
        }
      },
  ],
  [
    "array_make",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const count = stack.pop() as StackItemValueNumber | undefined;
        if (
          !count ||
          count.type !== StackItemType.value ||
          count.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Not a proper number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        // use the count to take each item from the stack and create a new array, if not enough items them crash
        const arrayValue: StackItemValue[] = [];
        for (let i = 0; i < count.value; i++) {
          const item = stack.pop();
          if (!item) {
            throw new CompileError({
              name,
              message: "Not enough items on the stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          arrayValue.push(item);
        }
        const newItem = valueTypes.toStackItemValue(StackItemValueType.array, {
          value: arrayValue,
          lineNo,
        });
        stack.push(newItem);
      },
  ],
  [
    "array_make_dict",
    ({ name, programName, functionName, lineNo, valueTypes }) =>
      (stack) => {
        const count = stack.pop() as StackItemValueNumber | undefined;
        if (
          !count ||
          count.type !== StackItemType.value ||
          count.subType !== StackItemValueType.number
        ) {
          throw new CompileError({
            name,
            message: "Not a proper number on top of the stack.",
            line: lineNo,
            fn: functionName,
            program: programName,
          });
        }
        // use the count to take each item from the stack and create a new dictionary, if not enough items them crash
        const dictionary: StackItemValueDictionaryValue = {};
        for (let i = 0; i < count.value; i++) {
          const key = stack.pop();
          const value = stack.pop();
          if (!key || !value) {
            throw new CompileError({
              name,
              message: "Not enough items on the stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          if (
            key.type !== StackItemType.value ||
            (key.subType !== StackItemValueType.string &&
              key.subType !== StackItemValueType.number) ||
            value.type !== StackItemType.value
          ) {
            throw new CompileError({
              name,
              message: "Not a proper key or value on the stack.",
              line: lineNo,
              fn: functionName,
              program: programName,
            });
          }
          dictionary[key.value.toString()] = value;
        }
        const newItem = valueTypes.toStackItemValue(
          StackItemValueType.dictionary,
          {
            value: dictionary,
            lineNo,
          },
        );
        stack.push(newItem);
      },
  ],
  // [
  //   "array_ndiff",
  //   ({ name, programName, functionName, lineNo }) =>
  //     (stack) => {
  //       // Returns a list array, containing the difference of all the given arrays. Multiple
  //       // arrays are consecutively processed against the results of the previous difference,
  //       // from the top of the stack down.
  //       // eg. a1 a2 a3 3 array_ndiff -> a

  //       const num = stack.pop() as StackItemValueNumber | undefined;
  //       if (!num || num.type !== StackItemType.value) {
  //         throw new CompileError({
  //           name,
  //           message: "Not a proper number on top of the stack.",
  //           line: lineNo,
  //           fn: functionName,
  //           program: programName,
  //         });
  //       }
  //       const arrays: (StackItemValueArray | StackItemValueDictionary)[] = [];
  //       let inDictionary = false;
  //       for (let i = 0; i < num.value; i++) {
  //         const array = stack.pop();
  //         if (!array) {
  //           throw new CompileError({
  //             name,
  //             message: "Not enough items on the stack.",
  //             line: lineNo,
  //             fn: functionName,
  //             program: programName,
  //           });
  //         }
  //         if (
  //           array.type !== StackItemType.value ||
  //           (array.subType !== StackItemValueType.array &&
  //             array.subType !== StackItemValueType.dictionary)
  //         ) {
  //           throw new CompileError({
  //             name,
  //             message: "Not a proper array or dictionary on the stack.",
  //             line: lineNo,
  //             fn: functionName,
  //             program: programName,
  //           });
  //         }
  //         if (array.subType === StackItemValueType.dictionary) {
  //           inDictionary = true;
  //         }
  //         arrays.push(array);
  //       }
  //       let currentStackItem = inDictionary ? {
  //         type: StackItemType.value,
  //         subType: StackItemValueType.dictionary,
  //         value: {} as StackItemValueDictionaryValue,
  //       } as StackItemValueDictionary : {
  //         type: StackItemType.value,
  //         subType: StackItemValueType.array,
  //         value: [] as StackItemValue[],
  //       } as StackItemValueArray;
  //       arrays.forEach((array) => {
  //         if (inDictionary) {
  //           for (const key in array.value) {
  //             if (key in currentStackItem.value) {
  //               delete currentStackItem.value[key];
  //             } else {
  //               currentStackItem.value[key] = array.value[key];
  //             }
  //           }
  //         } else {
  //           currentStackItem.values
  //         }
  //       });
  //     },
  // ],
];
