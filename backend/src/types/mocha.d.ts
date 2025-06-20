declare module 'mocha' {
    export * from '@types/mocha';
}

// Declaraciones globales para funciones de Mocha
declare const describe: Mocha.SuiteFunction;
declare const it: Mocha.TestFunction;
declare const before: Mocha.HookFunction;
declare const after: Mocha.HookFunction;
declare const beforeEach: Mocha.HookFunction;
declare const afterEach: Mocha.HookFunction; 