import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createLeave } from "../../services/leave.service";

const Leave = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.leave);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    dispatch(createLeave(data))
      .unwrap()
      .then(() => reset())
      .catch((error) => {
        console.error("Error create leave:", error);
      });
  };

  return (
    <section className="h-[80vh] flex justify-center items-center text-white">
      <div className="w-full sm:w-[95%] rounded-2xl p-5 sm:p-8">
        <form className="space-y-2  text-sm" onSubmit={handleSubmit(onSubmit)}>
          {/* Leave Type Select */}
          <div className="relative">
            <i className="fa fa-calendar-check text-sm absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <select
              {...register("leaveType", { required: "Leave type is required" })}
              className="w-full bg-[#EFEFEF] text-gray-800 text-center text-sm p-4 rounded-full border border-gray-200 pl-12 focus:ring-2 focus:ring-blue-500"
              id="select"
            >
              <option value="">--- Select Leave Type ---</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Vacation">Vacation Leave</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {/* Duration */}
          <div className="relative">
            <i className="fa fa-clock text-sm absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="number"
              placeholder="Duration (in days)"
              {...register("duration", {
                required: "Duration is required",
                min: { value: 1, message: "Duration must be at least 1 day" },
              })}
              className="w-full bg-[#EFEFEF] text-gray-800 text-sm p-4 rounded-full border border-gray-200 pl-12 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* From Date */}
          <div className="relative">
            <i className="fa fa-calendar text-sm absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="date"
              {...register("fromDate", { required: "From date is required" })}
              className="w-full bg-[#EFEFEF] text-gray-800 text-sm p-4 rounded-full border border-gray-200 pl-12 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <i className="fa fa-calendar text-sm absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="date"
              {...register("toDate", { required: "To date is required" })}
              className="w-full bg-[#EFEFEF] text-gray-800 text-sm p-4 rounded-full border border-gray-200 pl-12 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-sm p-4 rounded-full font-medium hover:bg-blue-600 transition duration-300"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin text-xs"></i>
            ) : (
              "Submit Leave Application"
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Leave;
