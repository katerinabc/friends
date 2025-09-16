import { Playfair_Display } from 'next/font/google';
import './globals.css';
import { FrameInit } from '@/components/FrameInit';

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Ethereal Quotes",
  description: "Inspiring quotes from legendary minds",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={playfair.variable}>
        <div>
          {children}
          <FrameInit />
        </div>
      </body>
    </html>
  );
}