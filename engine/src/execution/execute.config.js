export const languageConfigs = {
  c: {
    image: "gcc:latest",
    fileName: "main.c",
    compileCmd: (fileName) => `gcc ${fileName} -o main 2>compilation_error.log && chmod +x main`,
    runCmd: `./main < input.txt > stdout.log 2> stderr.log`,
    needsCompilation: true,
    errorParser: (stderr) => {
      if (/segmentation fault|sigsegv/i.test(stderr)) return "RUNTIME_ERROR_SIGSEGV";
      if (/floating point exception|sigfpe/i.test(stderr)) return "RUNTIME_ERROR_SIGFPE";
      if (/bus error|sigbus/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/killed|sigkill|out of memory/i.test(stderr)) return "MEMORY_LIMIT_EXCEEDED";
      if (/division by zero|divide by zero/i.test(stderr)) return "RUNTIME_ERROR_SIGFPE";
      if (/invalid pointer|bad alloc/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/stack smashing detected/i.test(stderr)) return "STACK_OVERFLOW";
      if (/abort|sigabrt/i.test(stderr)) return "RUNTIME_ERROR_SIGABRT";
      return "RUNTIME_ERROR_OTHER";
    },
  },
  cpp: {
    image: "gcc:latest",
    fileName: "main.cpp",
    compileCmd: (fileName) => `g++ ${fileName} -o main 2>compilation_error.log && chmod +x main`,
    runCmd: `./main < input.txt > stdout.log 2> stderr.log`,
    needsCompilation: true,
    errorParser: (stderr) => {
      if (/segmentation fault|sigsegv/i.test(stderr)) return "RUNTIME_ERROR_SIGSEGV";
      if (/floating point exception|sigfpe/i.test(stderr)) return "RUNTIME_ERROR_SIGFPE";
      if (/bus error|sigbus/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/killed|sigkill|out of memory|std::bad_alloc/i.test(stderr)) return "MEMORY_LIMIT_EXCEEDED";
      if (/division by zero|divide by zero/i.test(stderr)) return "RUNTIME_ERROR_SIGFPE";
      if (/invalid pointer|bad alloc/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/stack smashing detected|stack overflow/i.test(stderr)) return "STACK_OVERFLOW";
      if (/abort|sigabrt/i.test(stderr)) return "RUNTIME_ERROR_SIGABRT";
      if (/undefined reference|symbol not found/i.test(stderr)) return "COMPILATION_ERROR";
      return "RUNTIME_ERROR_OTHER";
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
      if (/stack overflow|java.lang.StackOverflowError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/class not found|ClassNotFoundException|NoClassDefFoundError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/null pointer|NullPointerException/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/array index|ArrayIndexOutOfBoundsException|StringIndexOutOfBoundsException/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/arithmetic exception|division by zero|ArithmeticException/i.test(stderr)) return "RUNTIME_ERROR_SIGFPE";
      if (/illegal argument|IllegalArgumentException/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/concurrent modification|ConcurrentModificationException/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/class cast|ClassCastException/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      return "RUNTIME_ERROR_OTHER";
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
      if (/indentation error|IndentationError|TabError/i.test(stderr)) return "SYNTAX_ERROR";
      if (/type error|TypeError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/value error|ValueError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/index error|IndexError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/key error|KeyError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/memory error|MemoryError/i.test(stderr)) return "MEMORY_LIMIT_EXCEEDED";
      if (/zero division|ZeroDivisionError/i.test(stderr)) return "RUNTIME_ERROR_SIGFPE";
      if (/name error|NameError|UnboundLocalError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/attribute error|AttributeError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/import error|ImportError|ModuleNotFoundError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/recursion error|RecursionError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      return "RUNTIME_ERROR_OTHER";
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
      if (/type error|TypeError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/reference error|ReferenceError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/range error|RangeError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/eval error|EvalError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/out of memory|heap out of memory|javascript heap/i.test(stderr)) return "MEMORY_LIMIT_EXCEEDED";
      if (/uri error|URIError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/aggregate error|AggregateError/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      if (/internal error|InternalError/i.test(stderr)) return "INTERNAL_ERROR";
      if (/stack overflow|maximum call stack/i.test(stderr)) return "STACK_OVERFLOW";
      if (/module not found/i.test(stderr)) return "RUNTIME_ERROR_OTHER";
      return "RUNTIME_ERROR_OTHER";
    },
  },
};