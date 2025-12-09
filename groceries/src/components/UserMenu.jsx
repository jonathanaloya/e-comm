import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Divider from "./Divider";
import { HiOutlineExternalLink } from "react-icons/hi";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

import { useGlobalContext } from "../provider/GlobalProvider";

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user);
  const { handleLogoutOut } = useGlobalContext();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?._id) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getUnreadRepliesCount
      });
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      // Silently handle error
    }
  };
  const handleLogout = async () => {
    handleLogoutOut();
    navigate("/login");
  };

  const handleClose = () => {
    if (close) {
      close();
    }
  };
  return (
    <div>
      <div className="font-semibold">My Account</div>
      <div className="text-sm flex items-center gap-1">
        <span className="max-w-52 text-ellipsis line-clamp-1">
          {user.name || user.mobile}{" "}

        </span>
        <Link
          onClick={handleClose}
          to={"/profile"}
          className=" hover:text-primary-200"
        >
          <HiOutlineExternalLink size={16} />
        </Link>
      </div>

      <Divider />

      <div className="text-sm grid gap-1">
        <Link
          onClick={handleClose}
          to={"/myorders"}
          className="px-2 hover:bg-orange-200 py-1"
        >
          My Orders
        </Link>

        <Link
          onClick={handleClose}
          to={"/address"}
          className="px-2 hover:bg-orange-200 py-1"
        >
          Save Address
        </Link>

        <Link
          onClick={handleClose}
          to={"/support-tickets"}
          className="px-2 hover:bg-orange-200 py-1 flex items-center justify-between"
        >
          <span>Support Tickets</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
              {unreadCount}
            </span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className="text-left px-2 hover:bg-red-200 py-1"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;