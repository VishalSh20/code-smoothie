export const languageConfigs = {
  c: {
    image: "gcc:latest",
    fileName: "main.c",
    compileCmd: (fileName) => `gcc ${fileName} -o main 2>compilation_error.log && chmod +x main`,
    runCmd: `./main < input.txt > stdout.log 2> stderr.log`,
    needsCompilation: true,
    errorParser: (stderr) => {
      if (/segmentation fault|sigsegv/i.test(stderr)) return "SEGMENTATION_FAULT";
      if (/floating point exception|sigfpe/i.test(stderr)) return "FLOATING_POINT_EXCEPTION";
      if (/bus error|sigbus/i.test(stderr)) return "BUS_ERROR";
      if (/killed|sigkill|out of memory/i.test(stderr)) return "MEMORY_LIMIT_EXCEEDED";
      if (/division by zero|divide by zero/i.test(stderr)) return "DIVISION_BY_ZERO";
      if (/invalid pointer|bad alloc/i.test(stderr)) return "INVALID_POINTER";
      if (/stack smashing detected/i.test(stderr)) return "STACK_OVERFLOW";
      if (/abort|sigabrt/i.test(stderr)) return "ABORT_ERROR";
      return "RUNTIME_ERROR";
    },
  },
  cpp: {
    image: "gcc:latest",
    fileName: "main.cpp",
    compileCmd: (fileName) => `g++ ${fileName} -o main 2>compilation_error.log && chmod +x main`,
    runCmd: `./main < input.txt > stdout.log 2> stderr.log`,
    needsCompilation: true,
    errorParser: (stderr) => {
      if (/segmentation fault|sigsegv/i.test(stderr)) return "SEGMENTATION_FAULT";
      if (/floating point exception|sigfpe/i.test(stderr)) return "FLOATING_POINT_EXCEPTION";
      if (/bus error|sigbus/i.test(stderr)) return "BUS_ERROR";
      if (/killed|sigkill|out of memory|std::bad_alloc/i.test(stderr)) return "MEMORY_LIMIT_EXCEEDED";
      if (/division by zero|divide by zero/i.test(stderr)) return "DIVISION_BY_ZERO";
      if (/invalid pointer|bad alloc/i.test(stderr)) return "INVALID_POINTER";
      if (/stack smashing detected|stack overflow/i.test(stderr)) return "STACK_OVERFLOW";
      if (/abort|sigabrt/i.test(stderr)) return "ABORT_ERROR";
      if (/undefined reference|symbol not found/i.test(stderr)) return "LINKER_ERROR";
      return "RUNTIME_ERROR";
    },
  },
  java: {
    image: "openjdk:latest",
    fileName: "Main.java",
    compileCmd: (fileName) => `javac ${fileName} 2>compilation_error.log`,
    runCmd: `java Main < input.txt > stdout.log 2> stderr.log`,
    needsCompilation: true,
    errorParser: (stderr) => {
      if (/out of memory|java.lang.OutOfMemoryError/i.test(stderr)) return "MEMORY_LIMIT_EXCEEDED";
      if (/stack overflow|java.lang.StackOverflowError/i.test(stderr)) return "STACK_OVERFLOW";
      if (/class not found|ClassNotFoundException|NoClassDefFoundError/i.test(stderr)) return "CLASS_NOT_FOUND";
      if (/null pointer|NullPointerException/i.test(stderr)) return "NULL_POINTER_EXCEPTION";
      if (/array index|ArrayIndexOutOfBoundsException|StringIndexOutOfBoundsException/i.test(stderr)) return "INDEX_OUT_OF_BOUNDS";
      if (/arithmetic exception|division by zero|ArithmeticException/i.test(stderr)) return "DIVISION_BY_ZERO";
      if (/illegal argument|IllegalArgumentException/i.test(stderr)) return "ILLEGAL_ARGUMENT";
      if (/concurrent modification|ConcurrentModificationException/i.test(stderr)) return "CONCURRENT_MODIFICATION";
      if (/class cast|ClassCastException/i.test(stderr)) return "CLASS_CAST_ERROR";
      return "RUNTIME_ERROR";
    },
  },
  python: {
    image: "python:latest",
    fileName: "main.py",
    compileCmd: () => "",
    runCmd: `python main.py < input.txt > stdout.log 2> stderr.log`,
    needsCompilation: false,
    errorParser: (stderr) => {
      if (/syntax error|SyntaxError/i.test(stderr)) return "SYNTAX_ERROR";
      if (/indentation error|IndentationError|TabError/i.test(stderr)) return "INDENTATION_ERROR";
      if (/type error|TypeError/i.test(stderr)) return "TYPE_ERROR";
      if (/value error|ValueError/i.test(stderr)) return "VALUE_ERROR";
      if (/index error|IndexError/i.test(stderr)) return "INDEX_ERROR";
      if (/key error|KeyError/i.test(stderr)) return "KEY_ERROR";
      if (/memory error|MemoryError/i.test(stderr)) return "MEMORY_LIMIT_EXCEEDED";
      if (/zero division|ZeroDivisionError/i.test(stderr)) return "DIVISION_BY_ZERO";
      if (/name error|NameError|UnboundLocalError/i.test(stderr)) return "NAME_ERROR";
      if (/attribute error|AttributeError/i.test(stderr)) return "ATTRIBUTE_ERROR";
      if (/import error|ImportError|ModuleNotFoundError/i.test(stderr)) return "IMPORT_ERROR";
      if (/recursion error|RecursionError/i.test(stderr)) return "RECURSION_ERROR";
      return "RUNTIME_ERROR";
    },
  },
  javascript: {
    image: "node:latest",
    fileName: "main.js",
    compileCmd: () => "",
    runCmd: `node main.js < input.txt > stdout.log 2> stderr.log`,
    needsCompilation: false,
    errorParser: (stderr) => {
      if (/syntax error|SyntaxError/i.test(stderr)) return "SYNTAX_ERROR";
      if (/type error|TypeError/i.test(stderr)) return "TYPE_ERROR";
      if (/reference error|ReferenceError/i.test(stderr)) return "REFERENCE_ERROR";
      if (/range error|RangeError/i.test(stderr)) return "RANGE_ERROR";
      if (/eval error|EvalError/i.test(stderr)) return "EVAL_ERROR";
      if (/out of memory|heap out of memory|javascript heap/i.test(stderr)) return "MEMORY_LIMIT_EXCEEDED";
      if (/uri error|URIError/i.test(stderr)) return "URI_ERROR";
      if (/aggregate error|AggregateError/i.test(stderr)) return "AGGREGATE_ERROR";
      if (/internal error|InternalError/i.test(stderr)) return "INTERNAL_ERROR";
      if (/stack overflow|maximum call stack/i.test(stderr)) return "STACK_OVERFLOW";
      if (/module not found/i.test(stderr)) return "MODULE_NOT_FOUND";
      return "RUNTIME_ERROR";
    },
  },
};