import * as SQLite from 'expo-sqlite';

// Open the database asynchronously using the async API
const openDB = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('MilkDeliveryDB');
//    console.log('Database initialized successfully:', db);
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
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
              milk_type TEXT NOT NULL DEFAULT 'buffalo',
              FOREIGN KEY (customer_id) REFERENCES customers(id)
            );

      CREATE TABLE IF NOT EXISTS milk_prices (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              milk_type TEXT UNIQUE,
              price REAL NOT NULL
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
//    console.log('Tables created successfully.');
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
//    console.log('Customer added:', { name, address, contact, result });
    return result;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const addDelivery = async (customerId, date, quantity, milkType) => {
  try {
    const db = await openDB();
    const result = await db.runAsync(
      'INSERT INTO deliveries (customer_id, date, quantity, milk_type) VALUES (?, ?, ?, ?)',
      customerId,
      date.trim(),
      quantity,
      milkType
    );
    return result;
  } catch (error) {
    console.error('Error adding delivery:', error);
    throw error;
  }
};

// ✅ Set Milk Price
export const setMilkPrice = async (milkType, price) => {
  try {
    const db = await openDB();
    await db.runAsync(
      'INSERT INTO milk_prices (milk_type, price) VALUES (?, ?) ON CONFLICT(milk_type) DO UPDATE SET price = excluded.price',
      milkType,
      price
    );
  } catch (error) {
    console.error('Error updating milk price:', error);
    throw error;
  }
};

// ✅ Get Milk Price
export const getMilkPrice = async (milkType) => {
  try {
    const db = await openDB();
    const result = await db.getAllAsync(
      'SELECT price FROM milk_prices WHERE milk_type = ?',
      [milkType]
    );
    return result[0]?.price || 0;
  } catch (error) {
    console.error('Error fetching milk price:', error);
    throw error;
  }
};

// ✅ Get Total Amount for Customer
export const getCustomerTotalAmount = async (customerId, month, year) => {
  try {
    const db = await openDB();

    // Fetch deliveries grouped by milk type
    const deliveries = await db.getAllAsync(
      `SELECT milk_type, SUM(quantity) AS total_quantity FROM deliveries WHERE customer_id = ? AND strftime('%Y-%m', date) = ? GROUP BY milk_type`,
      [customerId, `${year}-${month}`]
    );

    let totalAmount = 0;

    // Compute total cost dynamically
    for (const item of deliveries) {
      const price = await getMilkPrice(item.milk_type);
      totalAmount += item.total_quantity * price;
    }

    return totalAmount;
  } catch (error) {
    console.error('Error fetching customer total amount:', error);
    throw error;
  }
};

export const getAllCustomers = async () => {
  try {
    const db = await openDB();
    const customers = await db.getAllAsync('SELECT * FROM customers');
//    console.log('Fetched customers:', customers);
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const getCustomerDeliveries = async (customerId, month, year) => {
  try {
    const db = await openDB();
    const result = await db.getAllAsync(
      `
      SELECT
        deliveries.date,
        SUM(deliveries.quantity) AS total_quantity,
        GROUP_CONCAT(deliveries.milk_type || ' - ' || deliveries.quantity || ' L', ', ') AS milk_details
      FROM deliveries
      WHERE deliveries.customer_id = ? AND strftime('%Y-%m', deliveries.date) = ?
      GROUP BY deliveries.date
      ORDER BY deliveries.date ASC;
      `,
      [customerId, `${year}-${month}`]
    );
    return result;
  } catch (error) {
    console.error('Error fetching deliveries for customer:', error);
    throw error;
  }
};


export const getDeliveriesByDate = async (month, year) => {
  try {
    const db = await openDB();
    const result = await db.getAllAsync(
      `
      SELECT
        customers.name AS customerName,
        deliveries.customer_id,
        deliveries.date,
        SUM(deliveries.quantity) AS total_quantity
      FROM deliveries
      JOIN customers ON deliveries.customer_id = customers.id
      WHERE strftime('%Y-%m', deliveries.date) = ?
      GROUP BY deliveries.customer_id, deliveries.date
      ORDER BY customers.name ASC, deliveries.date ASC;
      `,
      [`${year}-${month}`] // Format: YYYY-MM
    );
//    console.log('Deliveries by date fetched:', result);
    return result;
  } catch (error) {
    console.error('Error fetching deliveries by date:', error);
    throw error;
  }
};

export const getCustomerDetails = async (customerId) => {
  try {
    const db = await openDB();
    const result = await db.getAllAsync(
      `SELECT * FROM customers WHERE id = ?`,
      [customerId]
    );
    return result[0]; // Return single customer details
  } catch (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }
};

export const getCustomerOrderHistory = async (customerId) => {
  try {
    const db = await openDB();
    const result = await db.getAllAsync(
      `SELECT * FROM deliveries WHERE customer_id = ? ORDER BY date DESC`,
      [customerId]
    );
    return result;
  } catch (error) {
    console.error('Error fetching deliveries for customer:', error);
    throw error;
  }
};

export const updateCustomer = async (customerId, name, address, contact) => {
  try {
    const db = await openDB();
    await db.runAsync(
      `UPDATE customers SET name = ?, address = ?, contact = ? WHERE id = ?`,
      [name, address, contact, customerId]
    );
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (customerId) => {
  try {
    const db = await openDB();

    // Check if customer has linked deliveries
    const deliveries = await db.getAllAsync(`SELECT id FROM deliveries WHERE customer_id = ?`, [customerId]);
    if (deliveries.length > 0) {
      throw new Error('Cannot delete. Customer has linked deliveries.');
    }

    // Perform deletion
    await db.runAsync(`DELETE FROM customers WHERE id = ?`, [customerId]);

  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Fetch total deliveries for a given month and year
export const getTotalDeliveriesForMonth = async (month, year) => {
  try {
    const db = await openDB();
    const result = await db.getAllAsync(
      `SELECT COUNT(*) AS total_deliveries FROM deliveries WHERE date LIKE ?`,
      [`${year}-${month}-%`] // ✅ Matches stored format YYYY-MM-DD
    );
//    console.log("Total deliveries result:", result);
    return result[0]?.total_deliveries || 0;
  } catch (error) {
    console.error('Error fetching total deliveries:', error);
    throw error;
  }
};


export const getTotalQuantityForMonth = async (month, year) => {
  try {
    const db = await openDB();
    const result = await db.getAllAsync(
      `
      SELECT
        milk_type,
        SUM(quantity) AS total_quantity
      FROM deliveries
      WHERE strftime('%Y-%m', date) = ?
      GROUP BY milk_type;
      `,
      [`${year}-${month}`]
    );

    // ✅ Structure response correctly
    let buffaloMilk = 0;
    let cowMilk = 0;
    result.forEach(item => {
      if (item.milk_type === 'buffalo') {
        buffaloMilk = item.total_quantity;
      } else if (item.milk_type === 'cow') {
        cowMilk = item.total_quantity;
      }
    });

    return { buffaloMilk, cowMilk };
  } catch (error) {
    console.error('Error fetching milk quantity:', error);
    throw error;
  }
};

export const getTotalCustomers = async () => {
  try {
    const db = await openDB();
    const result = await db.getAllAsync(`SELECT COUNT(*) AS total_customers FROM customers`);
//    console.log("Total customers result:", result);
    return result[0]?.total_customers || 0;
  } catch (error) {
    console.error("Error fetching total customers:", error);
    throw error;
  }
};

export const searchDeliveries = async (searchTerm) => {
  try {
    const db = await openDB();

    const result = await db.getAllAsync(
      `
      SELECT deliveries.date, customers.name AS customer_name, deliveries.quantity
      FROM deliveries
      JOIN customers ON deliveries.customer_id = customers.id
      WHERE deliveries.date LIKE ? OR customers.name = ?
      ORDER BY deliveries.date DESC;
      `,
      [`%${searchTerm}%`, searchTerm.trim()] // ✅ Ensures full name match instead of partial
    );

//    console.log('Search results:', result);
    return result;
  } catch (error) {
    console.error('Error searching deliveries:', error);
    throw error;
  }
};

export const getCustomerNames = async () => {
  try {
    const db = await openDB();
    const result = await db.getAllAsync(`SELECT name FROM customers`);
//    console.log("Customer names fetched:", result);
    return result.map(customer => customer.name); // ✅ Return only names
  } catch (error) {
    console.error("Error fetching customer names:", error);
    throw error;
  }
};

export { openDB };
