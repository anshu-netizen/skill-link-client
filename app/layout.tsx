import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "SkillLink",
  description: "SkillLink service booking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}