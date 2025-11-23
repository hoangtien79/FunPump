const express = require("express");
const {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  getUserComments,
} = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(getComments).post(protect, createComment);

router
  .route("/:id")
  .get(getComment)
  .put(protect, updateComment)
  .delete(protect, deleteComment);

router.post("/:id/like", protect, likeComment);
router.get("/user/:userId", getUserComments);

module.exports = router;
