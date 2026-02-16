console.log("✅ ROUTES FILE LOADED");

const express = require("express");
const router = express.Router();
const db = require("./db");


// CREATE or UPDATE TASK
router.post("/tasks", (req, res) => {
  const { id, task_name, description, task_date } = req.body;

  // validation
  if (!task_name || !description || !task_date) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  // convert date → YYYY-MM-DD
  const formattedDate = new Date(task_date)
    .toISOString()
    .split("T")[0];

  // 👉 IF ID EXISTS → UPDATE
  if (id) {
    db.query(
      "UPDATE tasks SET task_name=?, description=?, task_date=? WHERE id=?",
      [task_name, description, formattedDate, id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Database error",
            error: err.sqlMessage
          });
        }

        return res.status(200).json({
          success: true,
          message: "Task updated successfully"
        });
      }
    );
  }

  // 👉 IF NO ID → INSERT
  else {
    db.query(
      "INSERT INTO tasks (task_name, description, task_date) VALUES (?, ?, ?)",
      [task_name, description, formattedDate],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Database error",
            error: err.sqlMessage
          });
        }

        res.status(201).json({
          success: true,
          message: "Task added successfully",
          insertedId: result.insertId
        });
      }
    );
  }
});




// GET TASKS WITH PAGINATION
router.get("/tasks", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  db.query(
    "SELECT * FROM tasks ORDER BY id DESC LIMIT ? OFFSET ?",
    [limit, offset],
    (err, result) => {
      if (err) return res.status(500).json(err);

      db.query("SELECT COUNT(*) as total FROM tasks", (e, count) => {
        res.json({
          data: result,
          total: count[0].total,
          page,
          pages: Math.ceil(count[0].total / limit)
        });
      });
    }
  );
});



// DELETE TASK
router.delete("/tasks/:id", (req, res) => {

  const taskId = req.params.id;

  if (!taskId) {
    return res.status(400).json({
      success: false,
      message: "Task ID is required"
    });
  }

  db.query(
    "DELETE FROM tasks WHERE id=?",
    [taskId],
    (err, result) => {

      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.sqlMessage
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }

      res.json({
        success: true,
        message: "Task deleted successfully"
      });
    }
  );
});




// GET TASKS BY DATE
router.get("/tasks/date/:date", (req, res) => {
  db.query(
    "SELECT * FROM tasks WHERE task_date=?",
    [req.params.date],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );

});

module.exports = router;
