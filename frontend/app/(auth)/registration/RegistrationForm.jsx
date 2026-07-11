"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
};

export default function RegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const firstError = Object.values(data)[0];
        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : firstError || "Registration failed."
        );
        return;
      }

      router.push("/login?registered=1");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="_social_registration_form" onSubmit={handleSubmit}>
      {error && (
        <div className="row">
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <p style={{ color: "#e64848", marginBottom: 14 }}>{error}</p>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              className="form-control _social_registration_input"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              className="form-control _social_registration_input"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="form-control _social_registration_input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="form-control _social_registration_input"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
          <div className="form-check _social_registration_form_check">
            <input
              className="form-check-input _social_registration_form_check_input"
              type="radio"
              name="flexRadioDefault"
              id="flexRadioDefault2"
              defaultChecked
            />
            <label
              className="form-check-label _social_registration_form_check_label"
              htmlFor="flexRadioDefault2"
            >
              I agree to terms &amp; conditions
            </label>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
          <div className="_social_registration_form_btn _mar_t40 _mar_b60">
            <button
              type="submit"
              className="_social_registration_form_btn_link _btn1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Login now"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
