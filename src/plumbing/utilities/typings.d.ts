// Prevent typescript compile errors for libraries without TypeScript support
declare module 'electron-default-menu';
declare module 'electron-packager';
declare module 'opener';
declare module 'username';

// This is set by webpack and we use it to show stack traces in development builds
declare const SHOW_STACK_TRACE: boolean;
