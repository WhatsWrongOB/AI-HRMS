import express from "express";
import {
  markAttendance,
  getEmployeeAttendance,
  getAttendanceList,
  markAttendanceByQrCode,
  genrateQrCodeForAttendance,
  getMonthlyAttendancePercentage,
  getEmployeeAttendanceByDepartment,
} from "../controllers/attendance.controller.js";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";

const router = express.Router();

router.post("/mark", verifyAdminToken, markAttendance);
router.get("/employee", verifyEmployeeToken, getEmployeeAttendance);
router.get("/", verifyAdminToken, getAttendanceList);
router.get("/month", verifyAdminToken, getMonthlyAttendancePercentage);
router.post("/mark/qr", verifyEmployeeToken, markAttendanceByQrCode);
router.post("/generate", verifyEmployeeToken, genrateQrCodeForAttendance);
router.get("/department", verifyAdminToken, getEmployeeAttendanceByDepartment);

export default router;
