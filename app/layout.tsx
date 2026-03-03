import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Page Content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
