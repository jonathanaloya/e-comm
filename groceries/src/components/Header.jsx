import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import Search from "./Search";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from "../hooks/useMobile";
import { BsCart4 } from "react-icons/bs";
import { useSelector } from "react-redux";
import { GoTriangleUp, GoTriangleDown } from "react-icons/go";
import UserMenu from "./UserMenu";
import { DisplayPriceInShillings } from "../utils/DisplayPriceInShillings";
import { useGlobalContext } from '../provider/GlobalProvider';
import DisplayCartItem from "./DisplayCartItem";

const Header = () => {
  const [isMobile] = useMobile();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  // const [totalPrice, setTotalPrice] = useState(0);
  // const [totalQty, setTotalQty] = useState(0);
  const{totalPrice, totalQty} = useGlobalContext();
  const[openCartSection, setOpenCartSection] = useState(false);

  const handleCloseUserMenu = () => {
    setOpenUserMenu(false);
  };

  const redirectToLoginPage = () => {
    navigate("/login");
  };

  const handleMobileMenu = () => {
    if (!user._id) {
      navigate("/login");
      return;
    }
    navigate("/user");
  };

  //total price and quantity
  // useEffect(() => {
  //   const qty = cartItem.reduce((preve, curr) => {
  //     return preve + curr.quantity;
  //   }, 0);
  //   setTotalQty(qty);

  //   const tprice = cartItem.reduce((preve, curr) => {
  //     return preve + curr.productId.price * curr.quantity;
  //   }, 0);
  //   setTotalPrice(tprice);
  // }, [cartItem]);

  return (
    <header className="h-28 lg:h-20 lg:shadow-md sticky top-0 flex flex-col justify-center gap-1 bg-white z-40">
      {!(isSearchPage && isMobile) && (
        <div className="container mx-auto flex items-center  px-4 justify-between">
          {/**Logo */}
          <div className="h-full">
            <Link to="/" className="h-full  flex justify-center items-center">
              <img
                src={logo}
                width={120}
                height={60}
                alt="logo"
                className="hidden lg:block"
              />

              <img
                src={logo}
                width={100}
                height={60}
                alt="logo"
                className="lg:hidden"
              />
            </Link>
          </div>

          {/**Search Bar */}
          <div className="hidden lg:block">
            <Search />
          </div>

          {/** Login and my Cart */}
          <div>
            {/**User Icons display in mobile */}
            <button className="text-neutral-600 lg:hidden">
              <FaRegCircleUser size={26} onClick={handleMobileMenu} />
            </button>

            {/**User Icons display in desktop */}
            <div className="hidden lg:flex items-center gap-10">
              {user?._id ? (
                <div className="relative">
                  <div
                    onClick={() => setOpenUserMenu((preve) => !preve)}
                    className="flex items-center gap-1 cursor-pointer select-none"
                  >
                    <p>Account</p>
                    {openUserMenu ? (
                      <GoTriangleUp size={20} />
                    ) : (
                      <GoTriangleDown size={20} />
                    )}
                  </div>
                  {openUserMenu && (
                    <div className="absolute right-0 top-12">
                      <div className="bg-white p-4 rounded min-w-52 lg:shadow-lg">
                        <UserMenu close={handleCloseUserMenu} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={redirectToLoginPage} className="text-lg px-2">
                  Login
                </button>
              )}
              <button onClick={() => setOpenCartSection(true)} className="flex items-center gap-2 bg-green-800 hover:bg-green-700 px-3 py-1 rounded text-white">
                {/**Add to cart icon */}
                <div className="animate-bounce">
                  <BsCart4 size={28} />
                </div>
                {cartItem[0] ? (
                  <div>
                    <p>{totalQty} Items</p>
                    <p>{DisplayPriceInShillings(totalPrice)}</p>
                  </div>
                ) : (
                  <p>My Cart</p>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 lg:hidden">
        <Search />
      </div>

      {
        openCartSection && (
          <DisplayCartItem close={()=>setOpenCartSection(false)}/>
        )
      }
    </header>
  );
};

export default Header;
