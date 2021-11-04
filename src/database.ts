import { connect } from "mongoose";

connect(process.env.MONGO_URL, {})
  .then((db) => console.log("Database connected"))
  .catch((err) => console.log(err));
