const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");

require("dotenv").config();

// Set up view engine
app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.static("public"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Khai báo Todo Schema
const todoSchema = new mongoose.Schema(
  {
    description: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,
  },
  {
    timestamps: true,
  },
);

// Tạo model Todo từ schema
const Todo = mongoose.model("todo", todoSchema, "todos");

// Kết nối với MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Route cho trang chủ
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
