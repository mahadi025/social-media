"use client";

import { useRef, useState } from "react";

import { apiFetch } from "../../lib/api";
import Avatar from "./Avatar";
import styles from "./feed.module.css";

export default function PostComposer({ currentUser, onPostCreated }) {
  const currentUserName = `${currentUser.first_name} ${currentUser.last_name}`;
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    setImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim() && !image) {
      setError("Write something or add a photo first.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("visibility", visibility);
      if (image) formData.append("image", image);

      const post = await apiFetch("posts/", { method: "POST", body: formData });
      onPostCreated(post);
      setText("");
      clearImage();
      setVisibility("public");
    } catch (err) {
      setError(err.data?.non_field_errors?.[0] || "Couldn't publish your post.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <form onSubmit={handleSubmit}>
        <div className="_feed_inner_text_area_box">
          <div className="_feed_inner_text_area_box_image">
            <Avatar name={currentUserName} size={40} />
          </div>
          <div className="form-floating _feed_inner_text_area_box_form">
            <textarea
              className="form-control _textarea"
              placeholder="Write something ..."
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
        </div>

        {imagePreviewUrl && (
          <div className={styles.imagePreviewWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreviewUrl} alt="" className={styles.imagePreview} />
            <button type="button" className={styles.removeImageBtn} onClick={clearImage}>
              Remove
            </button>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className="_feed_inner_text_area_bottom">
          <div className="_feed_inner_text_area_item">
            <div className="_feed_inner_text_area_bottom_photo _feed_common">
              <button
                type="button"
                className="_feed_inner_text_area_bottom_photo_link"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z" />
                  </svg>
                </span>
                {image ? "Change photo" : "Photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>
            <div className={styles.visibilityPicker}>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                aria-label="Post visibility"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <div className="_feed_inner_text_area_btn">
            <button type="submit" className="_feed_inner_text_area_btn_link" disabled={isSubmitting}>
              <span>{isSubmitting ? "Posting..." : "Post"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
