import { Poppins } from "next/font/google";

import "../styles/vendor/bootstrap.min.css";
import "../styles/vendor/common.css";
import "../styles/vendor/main.css";
import "../styles/vendor/responsive.css";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Buddy Script",
  description: "Buddy Script",
  icons: {
    icon: "/assets/images/logo-copy.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
