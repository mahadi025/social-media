"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../../lib/api";
import styles from "./feed.module.css";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";

export default function Feed({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadFirstPage = useCallback(async () => {
    setInitialLoading(true);
    setError("");
    try {
      const data = await apiFetch("posts/");
      setPosts(data.results);
      setNextCursor(data.next);
    } catch {
      setError("Couldn't load the feed. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const url = new URL(nextCursor);
      const data = await apiFetch(`posts/${url.search}`);
      setPosts((prev) => [...prev, ...data.results]);
      setNextCursor(data.next);
    } finally {
      setLoadingMore(false);
    }
  }

  function handlePostCreated(post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handlePostUpdated(updatedPost) {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  }

  return (
    <div className={styles.feedColumn}>
      <PostComposer currentUser={currentUser} onPostCreated={handlePostCreated} />
      {error && <p className={styles.error}>{error}</p>}
      {initialLoading ? (
        <p className={styles.hint}>Loading feed...</p>
      ) : posts.length === 0 ? (
        <p className={styles.hint}>No posts yet. Be the first to share something.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onPostUpdated={handlePostUpdated}
          />
        ))
      )}
      {nextCursor && (
        <button
          type="button"
          className={styles.loadMoreBtn}
          onClick={loadMore}
          disabled={loadingMore}
        >
          {loadingMore ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
