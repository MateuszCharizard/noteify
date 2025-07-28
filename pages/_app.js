import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  
  return <Component {...pageProps} />;
}

export default MyApp;