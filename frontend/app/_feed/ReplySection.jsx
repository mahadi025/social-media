"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "../../lib/api";
import Avatar from "./Avatar";
import styles from "./feed.module.css";
import { timeAgo } from "./time";

export default function ReplySection({ commentId }) {
  const [replies, setReplies] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await apiFetch(`comments/${commentId}/replies/`);
      if (!cancelled) {
        setReplies(data.results);
        setNextPage(data.next);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [commentId]);

  async function loadMore() {
    if (!nextPage) return;
    const url = new URL(nextPage);
    const data = await apiFetch(`comments/${commentId}/replies/${url.search}`);
    setReplies((prev) => [...prev, ...data.results]);
    setNextPage(data.next);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const reply = await apiFetch(`comments/${commentId}/replies/`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setReplies((prev) => [...prev, reply]);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleReplyLike(reply) {
    const data = await apiFetch(`replies/${reply.id}/like/`, { method: "POST" });
    setReplies((prev) =>
      prev.map((r) =>
        r.id === reply.id
          ? { ...r, liked_by_me: data.liked, likes_count: data.likes_count }
          : r
      )
    );
  }

  return (
    <div className={styles.replySection}>
      {loading && <p className={styles.hint}>Loading replies...</p>}
      {nextPage && (
        <button type="button" className="_previous_comment_txt" onClick={loadMore}>
          View more replies
        </button>
      )}
      {replies.map((reply) => (
        <div className={styles.replyItem} key={reply.id}>
          <Avatar name={`${reply.author.first_name} ${reply.author.last_name}`} size={32} />
          <div>
            <h5 className={styles.replyAuthor}>
              {reply.author.first_name} {reply.author.last_name}
            </h5>
            <p className={styles.replyText}>{reply.text}</p>
            <div className={styles.replyMeta}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => toggleReplyLike(reply)}
              >
                {reply.liked_by_me ? "Liked" : "Like"} ({reply.likes_count})
              </button>
              <span>{timeAgo(reply.created_at)}</span>
            </div>
          </div>
        </div>
      ))}
      <form className={styles.replyForm} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Write a reply"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className={styles.replyInput}
        />
        <button type="submit" disabled={submitting} className={styles.replySubmit}>
          Reply
        </button>
      </form>
    </div>
  );
}
