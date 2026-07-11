import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "../lib/constants";
import Feed from "./_feed/Feed";
import styles from "./page.module.css";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const meRes = await fetch(`${process.env.DJANGO_API_URL}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!meRes.ok) {
    redirect("/login");
  }

  const user = await meRes.json();

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <p className={styles.topBarGreeting}>
          Welcome, {user.first_name} {user.last_name}
        </p>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className={styles.logoutButton}>
            Log out
          </button>
        </form>
      </header>
      <Feed currentUser={user} />
    </div>
  );
}
