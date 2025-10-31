declare module 'sql.js' {
  export type Database = any;
  export type SqlJsStatic = any;
  const initSqlJs: (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;
  export default initSqlJs;
}

