import React from 'react';
import Layout from './Layout';

export const metadata = {
  title: 'Familia Lagos APP',
  description: 'Familia Lagos APP.',
};

export default function RootLayout({ children }) {
  return <Layout title="Familia Lagos APP">{children}</Layout>;
}
