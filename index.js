const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");

require("dotenv").config();

// Cấu hình view engine với đường dẫn tuyệt đối
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI || process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Model Todo
const Todo = mongoose.model(
  "Todo",
  new mongoose.Schema(
    {
      description: String,
      deleted: { type: Boolean, default: false },
      deleteAt: Date,
    },
    { timestamps: true },
  ),
);

// Routes
app.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({ deleted: false });
    res.render("index", { todos });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
// Route thêm công việc
app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", async (req, res) => {
  const { description } = req.body;
  const newTodo = new Todo({
    description,
  });

  try {
    await newTodo.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route sửa công việc
app.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findById(id);
    res.render("edit", { todo });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  try {
    await Todo.findByIdAndUpdate(id, { description });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route xóa công việc
app.get("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Todo.findByIdAndUpdate(id, {
      deleted: true,
      deleteAt: new Date(),
      description: "Đang xóa...",
    });

    setTimeout(async () => {
      await Todo.findByIdAndDelete(id);
    }, 1000);

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = app;
