import { useEffect, useState } from "react";
import { formatDate } from "../../utils";
import { FaStar } from "react-icons/fa";
import { getFeedbacks } from "../../services/feedback";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import Pagination from "../../components/shared/others/Pagination";

function Feedback() {

  const dispatch = useDispatch();
  const { feedbacks, loading, pagination } = useSelector(
    (state) => state.feedback
  );

  const [reviewFilter, setReviewFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getFeedbacks({ review: reviewFilter, currentPage }));
  }, [reviewFilter, currentPage]);

  const filters = [
    { label: "All Feedbacks", value: "", icon: "fa-globe" },
    { label: "Positive Feedbacks", value: "Positive", icon: "fa-thumbs-up" },
    { label: "Negative Feedbacks", value: "Negative", icon: "fa-thumbs-down" },
    { label: "Neutral Feedbacks", value: "Neutral", icon: "fa-hand-paper" },
  ];

  return (
    <>
      {loading && <Loader />}

      <div className="w-full rounded-lg min-h-screen">
        
        <section className="bg-secondary p-3 sm:p-4 rounded-lg">
          <div className="mb-4 sm:px-4 flex flex-wrap items-center gap-2 sm:gap-3">
            {filters.map((filter, i) => (
              <button
                key={i}
                onClick={() => setReviewFilter(filter.value)}
                className={`flex flex-grow sm:flex-grow-0 justify-center items-center gap-2 text-[0.81rem] sm:text-[0.9rem]  border py-1 px-5 rounded-3xl font-semibold ${
                  reviewFilter === filter.value
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <i className={`text-xs fas ${filter.icon}`}></i>
                {filter.label}
              </button>
            ))}
          </div>

          <div id="overflow" className="overflow-x-auto min-h-[75vh]">
            <table className="min-w-full text-left table-auto border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-600 text-gray-200">
                  {[
                    "Emp ID",
                    "Name",
                    "Department",
                    "Position",
                    "AI Review",
                    "Description",
                    "Date",
                    "Rating",
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="py-3 px-4 border-b border-gray-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback, index) => (
                  <tr
                    key={index}
                    className="even:bg-gray-800 odd:bg-gray-700 hover:bg-gray-600"
                  >
                    <td className="py-3 px-4 border-b border-gray-500">
                      {feedback.employee.employeeId}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-500">
                      {feedback.employee.name}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-500">
                      {feedback.employee.department.name}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-500">
                      {feedback.employee.role.name}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-500">
                      {feedback.review}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-500">
                      {feedback.description.slice(0, 10) + "..."}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-500">
                      {formatDate(feedback.createdAt)}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-500 flex items-center gap-2">
                      {feedback.rating} <FaStar color="gold" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && feedbacks.length === 0 && (
              <div className="w-full h-[50vh] flex flex-col justify-center items-center">
                <i className="fas fa-ban text-2xl text-gray-400"></i>
                <p className="mt-2 text-base text-gray-400">No feedback found</p>
              </div>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={pagination?.totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>
    </>
  );
}

export default Feedback;
