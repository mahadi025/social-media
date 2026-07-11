"use client";

import { useState } from "react";

import { apiFetch } from "../../lib/api";
import Avatar from "./Avatar";
import CommentSection from "./CommentSection";
import styles from "./feed.module.css";
import LikersList from "./LikersList";
import { timeAgo } from "./time";

export default function PostCard({ post, currentUser, onPostUpdated }) {
  const [showComments, setShowComments] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  async function toggleLike() {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const data = await apiFetch(`posts/${post.id}/like/`, { method: "POST" });
      onPostUpdated({ ...post, liked_by_me: data.liked, likes_count: data.likes_count });
    } finally {
      setIsToggling(false);
    }
  }

  function handleCommentAdded() {
    onPostUpdated({ ...post, comments_count: post.comments_count + 1 });
  }

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <Avatar name={`${post.author.first_name} ${post.author.last_name}`} size={44} />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.author.first_name} {post.author.last_name}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.created_at)} .{" "}
                {post.visibility === "private" ? "Private" : "Public"}
              </p>
            </div>
          </div>
        </div>
        {post.text && <h4 className="_feed_inner_timeline_post_title">{post.text}</h4>}
        {post.image && (
          <div className="_feed_inner_timeline_image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt="" className="_time_img" />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <LikersList kind="posts" id={post.id} count={post.likes_count} />
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setShowComments((v) => !v)}
            >
              {post.comments_count} Comment{post.comments_count === 1 ? "" : "s"}
            </button>
          </p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction">
        <button
          type="button"
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${
            post.liked_by_me ? "_feed_reaction_active" : ""
          }`}
          onClick={toggleLike}
          disabled={isToggling}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>{post.liked_by_me ? "Liked" : "Like"}</span>
          </span>
        </button>
        <button
          type="button"
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={() => setShowComments((v) => !v)}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>Comment</span>
          </span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}
