import React, { useState } from 'react';
import Link from 'next/link';
import {
  BiHomeHeart,
  BiPhotoAlbum,
  BiGridVertical,
  BiXCircle,
} from 'react-icons/bi';
import { BsSpeedometer } from 'react-icons/bs';
import { MdOutlineSpaceDashboard } from 'react-icons/md';

import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const [toggleMenu, setToggleMenu] = useState(false);

  const toggleMenuHandler = () => {
    setToggleMenu(!toggleMenu);
  };

  const handleHomeClick = () => {
    // Check if the current route is the home page
    if (router.pathname === '/') {
      router.reload();
    } else {
      router.push('/');
    }
  };

  return (
    <div>
      <div className={toggleMenu ? 'nav__menu show-menu' : 'nav__menu'}>
        <div className="nav__list grid">
          <Link href="/" className="nav__link" onClick={handleHomeClick}>
            <BiHomeHeart className="uil uil-estate nav__icon" />
            Home
          </Link>

          <Link href="/admin/products" className="nav__link">
            <BiPhotoAlbum className="uil uil-scenery nav__icon" />
            Registros
          </Link>
          <Link href="/admin/consumos" className="nav__link">
            <BsSpeedometer className="uil uil-estate nav__icon" />
            Consumos
          </Link>
        </div>
        <BiXCircle
          className="uil uil-times nav__close"
          onClick={toggleMenuHandler}
        />
      </div>
      <div className="nav__toggle" onClick={toggleMenuHandler}>
        <BiGridVertical className="uil uil-apps" />
      </div>
    </div>
  );
};

export default Navbar;
