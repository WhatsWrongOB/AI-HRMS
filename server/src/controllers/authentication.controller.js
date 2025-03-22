import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { catchErrors } from "../utils/index.js";
import Employee from "../models/employee.model.js";
import { passwordRecovery } from "../templates/index.js";

const login = catchErrors(async (req, res) => {
  const { employeeId, password, authority, remember } = req.body;

  if (!employeeId || !password || !authority)
    throw new Error("Please provide all fields");

  const employee = await Employee.findOne({ employeeId })
    .populate("department", "name")
    .populate("role", "name");

  if (!employee)
    throw new Error(
      "Invalid credentials, try again with the correct credentials"
    );

  if (employee?.loggedIn) throw new Error("Account already loggedIn");

  if (authority.toLowerCase() === "admin" && !employee.admin)
    throw new Error("Unauthorize access");

  const comparePassword = await bcrypt.compare(password, employee.password);

  if (!comparePassword)
    throw new Error(
      "Invalid credentials, try again with the correct credentials"
    );

  const token = jwt.sign({ employeeId: employee._id }, process.env.JWTSECRET, {
    expiresIn: remember ? "10d" : "1d",
  });

  await employee.save();

  return res.status(201).json({
    success: true,
    message: "Logged in successfuly 🔑",
    token,
    user: {
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.role,
      profilePicture: employee.profilePicture,
      authority: authority.toLowerCase(),
      remember,
    },
  });
});

const updatePassword = catchErrors(async (req, res) => {
  const { credentials } = req.body;
  const id = req.user;

  if (!credentials) throw new Error("All fields are required");

  const { newPassword, oldPassword, confirmPassword } = credentials;

  if (newPassword !== confirmPassword) throw new Error("Passwords don't match");

  const employee = await Employee.findById(id);

  const isOldPasswordValid = await bcrypt.compare(
    oldPassword,
    employee.password
  );
  if (!isOldPasswordValid) throw new Error("Invalid credentials");

  const isNewPasswordSameAsOld = await bcrypt.compare(
    newPassword,
    employee.password
  );
  if (isNewPasswordSameAsOld)
    throw new Error("New password cannot be the same as the old password");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  employee.password = hashedPassword;
  await employee.save();

  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

const logout = catchErrors(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

const forgetPassword = catchErrors(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new Error("Email is required");

  const employee = await Employee.findOne({ email }).select("name email");

  if (!employee) throw new Error("Invalid email address");

  const token = jwt.sign({ employeeId: employee._id }, process.env.JWTSECRET, {
    expiresIn: "1h",
  });

  const resetURL = `${process.env.CLIENT_URL}/reset/password?verifyToken=${token}&employee=${employee._id}`;

  await passwordRecovery({
    email: employee.email,
    name: employee.name,
    resetURL,
  });

  employee.forgetPasswordToken = token;

  await employee.save();

  return res.status(200).json({
    success: true,
    message: "Password reset email sent successfully",
  });
});

const resetPassword = catchErrors(async (req, res) => {
  const { newPassword, confirmPassword, employeeId, forgetPasswordToken } =
    req.body;

  const employee = await Employee.findById(employeeId);

  if (!employee) throw new Error("Employee not found");

  if (employee.forgetPasswordToken !== forgetPasswordToken)
    throw new Error("Invalid verify password tokrn");

  if (newPassword !== confirmPassword) throw new Error("Passwords don't match");

  if (await bcrypt.compare(newPassword, employee.password))
    throw new Error(
      "The new password cannot be the same as your old password."
    );

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  employee.password = hashedPassword;
  employee.forgetPasswordToken = undefined;

  await employee.save();

  return res.status(200).json({
    success: true,
    message: "Password set successfully",
  });
});

export { login, logout, updatePassword, forgetPassword, resetPassword };
