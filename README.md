# Forth Interpreter

This is unfinished and untested. It is only uploaded to git until it is completed.

This is a very very much a pre alpha product.

# What is done

- the compiler is ready for testing
- the interpreter is ready for testing
- the value types is ready for testing
- the internal functions are ready for testing, but more needed to be added

# What needs to be done

- support for checking of custom types in compiler
- make compiler and interpreter async/await capable

**In compile time**:

- support for $include to include outside programs
- support for public statement for exporting functions (also want to support variables)
- Add switch-case support? (take one value, then check truthiness with a switch stack at each case, or make switch always require equal to comparisons)
- support for [ ] parameter checking that some systems have (how to approach? or just make it as comments?)

**New functions**:

- support exit
- Support abort for force error crash
- support try catch and error handling
- Finish adding string, math, time, and array/dictionary functions
- look into multitasking functions or those should be extended functions?
- support var! lvar, localvar, variable functions
