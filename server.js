const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require("./app");
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then((db) => console.log("Mongo connnected sucessfully"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
// unhandle promise rejection
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
