const app = require('./vaxapp');
const port = process.env.PORT || 3000;

//// Start server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
