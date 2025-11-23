const Comment = require("../models/Comment");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    // Join comment room
    socket.on("join-comments", () => {
      socket.join("comments-room");
      console.log(`User ${socket.id} joined comments room`);
    });

    // Handle new comment
    socket.on("new-comment", async (data) => {
      try {
        const comment = await Comment.findById(data.commentId).populate(
          "author",
          "username avatar"
        );

        // Broadcast to all clients in the room
        io.to("comments-room").emit("comment-added", comment);
      } catch (error) {
        console.error("Error broadcasting new comment:", error);
      }
    });

    // Handle comment update
    socket.on("update-comment", async (data) => {
      try {
        const comment = await Comment.findById(data.commentId).populate(
          "author",
          "username avatar"
        );

        io.to("comments-room").emit("comment-updated", comment);
      } catch (error) {
        console.error("Error broadcasting comment update:", error);
      }
    });

    // Handle comment deletion
    socket.on("delete-comment", (data) => {
      io.to("comments-room").emit("comment-deleted", {
        commentId: data.commentId,
      });
    });

    // Handle comment like
    socket.on("like-comment", async (data) => {
      try {
        const comment = await Comment.findById(data.commentId);

        io.to("comments-room").emit("comment-liked", {
          commentId: data.commentId,
          likes: comment.likes.length,
        });
      } catch (error) {
        console.error("Error broadcasting comment like:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};
