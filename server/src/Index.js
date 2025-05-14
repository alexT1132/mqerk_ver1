import App from "./App.js";
import { connectDB } from "./Db.js";

connectDB();
App.listen(2000);
console.log("Server is running on port", 2000);