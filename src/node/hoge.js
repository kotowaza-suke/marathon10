const express = require('express');
const app = express();
const port = 5018;

app.get('/', (req, res) => {
  res.send('Wanted! Wanted!');
});

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});