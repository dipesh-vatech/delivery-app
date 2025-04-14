import * as SQLite from 'expo-sqlite';
console.log('SQLite module:', SQLite);

// Open the database asynchronously using the async API
const openDB = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('MilkDeliveryDB');
    console.log('Database initialized successfully:', db);
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Verify the schema of the "customers" table using PRAGMA
export const verifySchema = async () => {
  try {
    const db = await openDB();
    const result = await db.execAsync(`PRAGMA table_info(customers);`, []);
    console.log('Customers table schema:', result);
    return result;
  } catch (error) {
    console.error('Error verifying schema:', error);
    throw error;
  }
};

// Verify all existing tables in the database
export const verifyTables = async () => {
  try {
    const db = await openDB();
    // Using getAllAsync() to retrieve all table names from sqlite_master
    const result = await db.getAllAsync('SELECT name FROM sqlite_master WHERE type="table";');
    console.log('Existing tables in the database:', result);
    return result;
  } catch (error) {
    console.error('Error verifying tables:', error);
    throw error;
  }
};

// Create tables using a multi‑statement SQL script executed in bulk.
// This includes setting the journal mode and creating 3 tables.
export const createTables = async () => {
  try {
    const db = await openDB();
    const sql = `
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        contact TEXT
      );

      CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        quantity REAL NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS summaries (
        customer_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        total_quantity REAL NOT NULL,
        PRIMARY KEY (customer_id, month),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `;
    await db.execAsync(sql);
    console.log('Tables created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Add a new customer to the "customers" table. This function uses runAsync()
// to perform a parameterized INSERT.
export const addCustomer = async (name, address, contact) => {
  try {
    const db = await openDB();
    const result = await db.runAsync(
      'INSERT INTO customers (name, address, contact) VALUES (?, ?, ?)',
      name.trim(),
      address.trim(),
      contact.trim()
    );
    console.log('Customer added:', { name, address, contact, result });
    return result;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export { openDB };
