import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="p-4 border-b flex gap-4">
          <Link href="/members">Members</Link>
          <Link href="/trainers">Trainers</Link>
          <Link href="/workout-plans">Workout Plans</Link>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
