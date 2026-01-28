"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  editedAt?: Date | string;
  editedBy?: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  replies?: Comment[];
  parentId?: string;
}

interface CommentsProps {
  comments: Comment[];
  ticketId: string;
  currentUserId: string;
}

export function Comments({ comments, ticketId, currentUserId }: CommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setNewComment("");
      window.location.reload();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(
        `/api/tickets/${ticketId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: editContent }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      setEditingId(null);
      setEditContent("");
      window.location.reload();
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(
        `/api/tickets/${ticketId}/comments/${commentId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const handleReplyToComment = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add reply");
      }

      setReplyingTo(null);
      setReplyContent("");
      window.location.reload();
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Failed to add reply");
    }
  };

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) => (
    <div className={`${isReply ? "ml-12 mt-3" : "mb-6"}`}>
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {comment.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {comment.user.name}
            </span>
            {comment.isPrivate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                Private
              </span>
            )}
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
            {comment.editedAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {editingId === comment.id ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditContent("");
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          <div className="mt-2 flex items-center space-x-2">
            {comment.userId === currentUserId && (
              <>
                <button
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </>
            )}
            {!isReply && (
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Reply
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
              />
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleReplyToComment(comment.id)}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Comments ({comments.length})
        </h2>
      </div>

      <div className="px-6 py-4">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="mt-2">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div>
            {comments
              .filter((comment) => !comment.parentId) // Pokaż tylko główne komentarze
              .map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
          </div>
        )}

        <form onSubmit={handleSubmitComment} className="mt-6">
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Add a comment
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Share your thoughts..."
            />
          </div>
          <div className="mt-3">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
