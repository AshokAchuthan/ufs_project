
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
  res.send("Backend API running 🚀");
});

const routes = require("./routes");
app.use("/api", routes);

app.listen(3000,()=>{
 console.log("Server running http://localhost:3000");
});
