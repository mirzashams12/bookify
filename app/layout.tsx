import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Page Content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
