import Attendance from "../models/attendance.js";
import Department from "../models/department.js";
import Employee from "../models/employee.js";
import { catchErrors } from "../utils/index.js";
import { myCache } from "../utils/index.js";

const getAttendanceList = catchErrors(async (req, res) => {
  const { department } = req.query;

  if (!department) throw new Error("Please provide department to get sheet");

  const employees = await Employee.find({ department }).select(
    "name employeeId"
  );

  return res.status(201).json({
    success: true,
    message: "Attendance list fetched successfully",
    employees,
  });
});

const markAttendance = catchErrors(async (req, res) => {
  const { attendanceRecords } = req.body;

  if (!attendanceRecords || attendanceRecords.length === 0) {
    throw new Error("Please provide valid attendance records");
  }

  const attendance = attendanceRecords.map(({ employee, date, status }) => ({
    employee,
    date: new Date(date).toISOString(),
    status,
  }));

  const existingRecords = await Attendance.find({
    $or: attendance.map(({ employee, date }) => ({
      employee,
      date: new Date(date),
    })),
  });

  const existingMap = new Set(
    existingRecords.map(
      (record) => `${record.employee}-${record.date.toISOString()}`
    )
  );

  const newAttendance = attendance.filter(
    ({ employee, date }) => !existingMap.has(`${employee}-${date}`)
  );

  if (newAttendance.length === 0) {
    throw new Error("Attendance already marked");
  }

  await Attendance.insertMany(newAttendance);

  myCache.del("insights");

  return res.status(201).json({
    success: true,
    message: "Attendance marked successfully",
    addedRecords: newAttendance.length,
  });
});

const getEmployeeAttendance = catchErrors(async (req, res) => {
  const employeeID = req.user;

  if (!employeeID) throw new Error("Please provide employee id ");

  const attendanceRecord = await Attendance.find({ employee: employeeID })
    .populate({
      path: "employee",
      select: "name employeeId department role",
      populate: [
        {
          path: "department",
          select: "name",
        },
        {
          path: "role",
          select: "name",
        },
      ],
    })
    .sort({ date: -1 });

  if (!attendanceRecord || attendanceRecord.length === 0)
    throw new Error("No attendance records found");

  const totalDays = attendanceRecord.length;
  const presentDays = attendanceRecord.filter(
    (record) => record.status === "Present"
  ).length;
  const attendancePercentage = (presentDays / totalDays) * 100;

  return res.status(201).json({
    success: true,
    message: "Attendance fetched successfully",
    attendance: {
      attendancePercentage: attendancePercentage.toFixed(2),
      attendanceRecord,
    },
  });
});

const getDepartmentAttendancePercentage = async () => {
  try {
    const departmentAttendance = await Attendance.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: {
          path: "$employeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "employeeDetails.department",
          foreignField: "_id",
          as: "departmentDetails",
        },
      },
      {
        $unwind: {
          path: "$departmentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$departmentDetails.name",
          totalPresent: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
            },
          },
          totalRecords: { $sum: 1 },
        },
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [{ $divide: ["$totalPresent", "$totalRecords"] }, 100],
          },
        },
      },
      {
        $project: {
          _id: 1,
          attendancePercentage: 1,
        },
      },
      {
        $sort: {
          attendancePercentage: -1,
        },
      },
    ]);

    return departmentAttendance;
  } catch (error) {
    console.error(error.message);
  }
};

const getMonthlyAttendancePercentage = async () => {
  const year = new Date().getFullYear();

  const attendanceData = await Attendance.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$date" },
        totalRecords: { $sum: 1 },
        totalPresent: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        month: "$_id",
        _id: 0,
        attendancePercentage: {
          $multiply: [{ $divide: ["$totalPresent", "$totalRecords"] }, 100],
        },
      },
    },
    { $sort: { month: 1 } },
  ]);

  const formattedData = Array.from({ length: 12 }, (_, i) => {
    const monthData = attendanceData.find((data) => data.month === i + 1);
    return {
      month: new Date(0, i).toLocaleString("default", { month: "long" }),
      attendancePercentage:
        parseInt(monthData?.attendancePercentage.toFixed(2)) || 0,
    };
  });

  return formattedData;
};

export {
  getAttendanceList,
  markAttendance,
  getEmployeeAttendance,
  getDepartmentAttendancePercentage,
  getMonthlyAttendancePercentage,
};
