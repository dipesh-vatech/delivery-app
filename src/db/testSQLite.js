import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('TestDB');

export const testSQLite = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, name TEXT);',
      [],
      () => console.log('Table created successfully'),
      (_, error) => console.log('Error creating table', error)
    );
  });
};
