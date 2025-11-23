const express = require("express");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getAllComments,
  permanentlyDeleteComment,
  getStats,
  restoreComment,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Protect all routes and authorize admin only
router.use(protect);
router.use(authorize("admin"));

// User management routes
router.get("/users", getAllUsers);
router.route("/users/:id").get(getUser).put(updateUser).delete(deleteUser);

// Comment management routes
router.get("/comments", getAllComments);
router.delete("/comments/:id", permanentlyDeleteComment);
router.put("/comments/:id/restore", restoreComment);

// Statistics
router.get("/stats", getStats);

module.exports = router;
