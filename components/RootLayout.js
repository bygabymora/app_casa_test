import React from 'react';
import Layout from './Layout';

export const metadata = {
  title: 'Familia  APP',
  description: 'Familia APP.',
};

export default function RootLayout({ children }) {
  return <Layout title="Familia APP">{children}</Layout>;
}
