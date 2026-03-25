const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const indexRoute = require('./routes/index');

const app = express();
app.use(bodyParser.json());

app.use('/api', indexRoute);

const PORT = 3000;

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
