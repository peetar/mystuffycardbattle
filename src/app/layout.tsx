import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Ben's Stuffy Card Battle",
  description: '16-bit retro stuffed animal card battler with rogue-lite campaign and multiplayer!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
