const sidebarLinks = [
  {
    name: "Dashboard",
    iconClass: "fas fa-tachometer-alt",
    link: "/",
    childrens: [],
  },
  {
    name: "Employee Management",
    iconClass: "fas fa-user",
    childrens: [
      {
        name: "Employees Details",
        link: "/employees",
      },
      {
        name: "Create Employee",
        link: "/add-employee",
      },
    ],
  },
  {
    name: "Attendance Management",
    iconClass: "fas fa-calendar-check",
    link: "/mark-attendance",
  },
  {
    name: "Payroll Management",
    iconClass: "fas fa-wallet",
    link: "/payroll-management",
    childrens: [],
  },
  {
    name: "Leave Management",
    iconClass: "fas fa-calendar-alt",
    childrens: [
      {
        name: "Leave Requests",
        link: "/leave-request",
      },
      {
        name: "Employees On Leave",
        link: "/on-leave",
      },
    ],
  },
  {
    name: "Complaint Management",
    iconClass: "fas fa-exclamation-circle",
    link: "/complaint-management",
    childrens: [],
  },
  {
    name: "Feedback Management",
    iconClass: "fas fa-brain",
    link: "/feedback-management",
    childrens: [],
  },
  {
    name: "Reports & Analytics",
    iconClass: "fas fa-chart-bar",
    link: "/report",
    childrens: [],
  },
];

export { sidebarLinks };
