import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel | Appective',
  description: 'Appective Admin Panel',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
