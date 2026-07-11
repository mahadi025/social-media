"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "../../lib/api";
import Avatar from "./Avatar";
import styles from "./feed.module.css";
import LikersList from "./LikersList";
import ReplySection from "./ReplySection";
import { timeAgo } from "./time";

export default function CommentSection({ postId, currentUser, onCommentAdded }) {
  const currentUserName = `${currentUser.first_name} ${currentUser.last_name}`;
  const [comments, setComments] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openReplies, setOpenReplies] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await apiFetch(`posts/${postId}/comments/`);
      if (!cancelled) {
        setComments(data.results);
        setNextPage(data.next);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function loadMore() {
    if (!nextPage) return;
    const url = new URL(nextPage);
    const data = await apiFetch(`posts/${postId}/comments/${url.search}`);
    setComments((prev) => [...prev, ...data.results]);
    setNextPage(data.next);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const comment = await apiFetch(`posts/${postId}/comments/`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setComments((prev) => [...prev, comment]);
      setText("");
      onCommentAdded?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleCommentLike(comment) {
    const data = await apiFetch(`comments/${comment.id}/like/`, { method: "POST" });
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? { ...c, liked_by_me: data.liked, likes_count: data.likes_count }
          : c
      )
    );
  }

  return (
    <div className="_feed_inner_timeline_cooment_area">
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <Avatar name={currentUserName} size={26} />
            </div>
            <div className="_feed_inner_comment_box_content_txt">
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a comment"
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="_timline_comment_main">
        {loading && <p className={styles.hint}>Loading comments...</p>}
        {!loading && comments.length === 0 && (
          <p className={styles.hint}>No comments yet.</p>
        )}

        {nextPage && (
          <div className="_previous_comment">
            <button type="button" className="_previous_comment_txt" onClick={loadMore}>
              View more comments
            </button>
          </div>
        )}

        {comments.map((comment) => (
          <div className="_comment_main" key={comment.id}>
            <div className="_comment_image">
              <Avatar
                name={`${comment.author.first_name} ${comment.author.last_name}`}
                size={40}
              />
            </div>
            <div className="_comment_area">
              <div className="_comment_details">
                <div className="_comment_details_top">
                  <div className="_comment_name">
                    <h4 className="_comment_name_title">
                      {comment.author.first_name} {comment.author.last_name}
                    </h4>
                  </div>
                </div>
                <div className="_comment_status">
                  <p className="_comment_status_text">
                    <span>{comment.text}</span>
                  </p>
                </div>
                <div className="_total_reactions">
                  <LikersList kind="comments" id={comment.id} count={comment.likes_count} />
                </div>
                <div className="_comment_reply">
                  <div className="_comment_reply_num">
                    <ul className="_comment_reply_list">
                      <li>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => toggleCommentLike(comment)}
                        >
                          {comment.liked_by_me ? "Liked" : "Like"}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() =>
                            setOpenReplies((prev) => ({
                              ...prev,
                              [comment.id]: !prev[comment.id],
                            }))
                          }
                        >
                          Reply{comment.replies_count ? ` (${comment.replies_count})` : ""}
                        </button>
                      </li>
                      <li>
                        <span className="_time_link">{timeAgo(comment.created_at)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {openReplies[comment.id] && <ReplySection commentId={comment.id} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
