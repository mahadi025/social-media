"use client";

import { useState } from "react";

import { apiFetch } from "../../lib/api";
import styles from "./feed.module.css";

export default function LikersList({ kind, id, count }) {
  const [open, setOpen] = useState(false);
  const [likers, setLikers] = useState(null);
  const [loading, setLoading] = useState(false);

  async function toggleOpen() {
    if (!open && likers === null) {
      setLoading(true);
      try {
        const data = await apiFetch(`${kind}/${id}/likes/`);
        setLikers(data.results);
      } finally {
        setLoading(false);
      }
    }
    setOpen((v) => !v);
  }

  if (!count) {
    return <span className={styles.likesCountMuted}>No likes yet</span>;
  }

  return (
    <div className={styles.likersWrap}>
      <button type="button" className={styles.linkButton} onClick={toggleOpen}>
        {count} like{count === 1 ? "" : "s"}
      </button>
      {open && (
        <div className={styles.likersPopover}>
          {loading && <p>Loading...</p>}
          {likers?.length === 0 && <p>No likes yet.</p>}
          {likers?.map((user) => (
            <p key={user.id}>
              {user.first_name} {user.last_name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
