'use client';
import Signupbutton from './Signupbutton';
import React from 'react';
import Link from 'next/link';

import Image from 'next/image';
import Logo from '../public/images/assets/logo2.png';
import Logo2 from '../public/images/assets/logo.png';
import Navbar from './Navbar';

import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();

  const handleHomeClick = () => {
    if (router.pathname === '/') {
      router.reload();
    } else {
      router.push('/');
    }
  };
  return (
    <>
      <header className="header  flex flex-col">
        <nav className="nav container">
          <div className="flex h-12 items-center">
            <div className="flex h-12 items-center">
              <Link
                href="/"
                className="nav__logo logo"
                onClick={handleHomeClick}
              >
                <div className="r__logo r__logo-1">
                  <Image src={Logo2} alt="logo" width={500} />
                </div>
              </Link>
              <Link
                href="/"
                className="nav__logo_2 logo"
                onClick={handleHomeClick}
              >
                <div className="r__logo r__logo-2 ">
                  <Image src={Logo} alt="logo" width={400} />
                </div>
              </Link>
            </div>

            <div className="nav-reverse flex h-12 place-items-center gap-4">
              <Signupbutton />
              <Navbar />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
