import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import { Link, useNavigate } from "react-router-dom";
import SummaryApi from "../common/SummaryApi";

function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Password strength checker with detailed feedback
  const getPasswordErrors = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters including letters, numbers, and special characters.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must include at least one number.");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("Password must include at least one special character.");
    }
    return errors;
  };

  const validateFields = () => {
    const newErrors = {};
    if (!data.name) newErrors.name = "Name is required.";
    if (!data.email) newErrors.email = "Email is required.";
    if (!data.password) {
      newErrors.password = "Password is required.";
    } else {
      const passwordErrors = getPasswordErrors(data.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join(" ");
      }
    }
    if (!data.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    if (
      data.password &&
      data.confirmPassword &&
      data.password !== data.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = validateFields();
    if (!valid) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    try {
      const response = await Axios({
        ...SummaryApi.register,
        data: data,
      });
      // Only show backend error if frontend validation passed and backend error is not generic
      if (response.data.error) {
        if (
          response.data.errors &&
          response.data.errors.length > 0 &&
          response.data.errors[0] !== "validation failed"
        ) {
          toast.error(response.data.errors[0]);
        } else if (
          response.data.message &&
          response.data.message !== "validation failed"
        ) {
          toast.error(response.data.message);
        }
        // If backend returns generic 'validation failed', ignore it (frontend already showed errors)
      }
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/login");
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="w-full container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white my-4 w-full max-w-md sm:max-w-lg mx-auto rounded-lg shadow-md p-4 sm:p-6">
        <p>Welcome to Fresh Katale</p>

        <form className="grid gap-4 mt-6" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="name">Name :</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              autoFocus
              name="name"
              className={`bg-green-50 p-3 border rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 w-full text-base ${
                errors.name ? "border-red-500" : ""
              }`}
              value={data.name}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name}</span>
            )}
          </div>
          <div className="grid gap-1">
            <label htmlFor="email">Email :</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className={`bg-green-50 p-3 border rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 w-full text-base ${
                errors.email ? "border-red-500" : ""
              }`}
              value={data.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="text-red-500 text-xs">{errors.email}</span>
            )}
          </div>
          <div className="grid gap-1">
            <label htmlFor="password">Password :</label>
            <div
              className={`bg-green-50 p-3 border rounded-lg flex items-center focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 ${
                errors.password ? "border-red-500" : ""
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                className="w-full outline-none text-base bg-transparent"
                value={data.password}
                onChange={handleChange}
              />
              <div
                onClick={() => setShowPassword((preve) => !preve)}
                className="cursor-pointer"
              >
                {showPassword ? (
                  <FaRegEye size={20} />
                ) : (
                  <FaRegEyeSlash size={20} />
                )}
              </div>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs">{errors.password}</span>
            )}
          </div>
          <div className="grid gap-1">
            <label htmlFor="confirmPassword">Confirm Password :</label>
            <div
              className={`bg-green-50 p-3 border rounded-lg flex items-center focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
            >
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Please Confirm Password"
                className="w-full outline-none text-base bg-transparent"
                value={data.confirmPassword}
                onChange={handleChange}
              />
              <div
                onClick={() => setShowConfirmPassword((preve) => !preve)}
                className="cursor-pointer"
              >
                {showConfirmPassword ? (
                  <FaRegEye size={20} />
                ) : (
                  <FaRegEyeSlash size={20} />
                )}
              </div>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            disabled={!validateValue}
            className={` ${
              validateValue ? "bg-green-800 hover:bg-green-600" : "bg-gray-500"
            } text-white p-3 rounded-lg font-semibold my-4 tracking-wider w-full text-base transition-colors`}
          >
            Register
          </button>
        </form>

        <p>
          Already have an account ?
          <Link
            to={"/login"}
            className="text-green-700 hover:text-green-800 font-semibold"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
