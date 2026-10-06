const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 5018;

const cors = require("cors");
app.use(cors());

// リクエストデータ読み取り
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { Pool } = require("pg");
const pool = new Pool({
  user: "user_95018", // PostgreSQLのユーザー名に置き換えてください
  host: "db",
  database: "crm_95018", // PostgreSQLのデータベース名に置き換えてください
  password: "pass_95018", // PostgreSQLのパスワードに置き換えてください
  port: 5432,
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});



app.get("/customers/:id", async (req, res) => {
  try {
    const customerId = req.params.id;

    const customerData = await pool.query(
      "SELECT * FROM customers WHERE customer_id = $1",
      [customerId]
    );

    if (customerData.rows.length === 0) {
      return res.status(404).json({ error: "顧客が見つかりません。" });
    }

    res.json(customerData.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "顧客情報の取得に失敗しました。" });
  }
});


app.put("/customers/:id", async (req, res) => {
  try {
    const customerId = req.params.id;
    const { company_name, industry, contact, location } = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET company_name = $1,
           industry = $2,
           contact = $3,
           location = $4
       WHERE customer_id = $5
       RETURNING *`,
      [company_name, industry, contact, location, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "顧客が見つかりません。"
      });
    }

    res.json({
      success: true,
      customer: result.rows[0]
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});



app.delete("/customers/:id", async (req, res) => {
  try {
    const customerId = req.params.id;

    const result = await pool.query(
      "DELETE FROM customers WHERE customer_id = $1 RETURNING *",
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "顧客が見つかりません。"
      });
    }

    res.json({
      success: true
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});




app.post("/add-customer", async (req, res) => {
  try {
    const { company_name, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [company_name, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.use(express.static("public"));
