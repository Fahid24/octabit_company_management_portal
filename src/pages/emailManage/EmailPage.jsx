import { useEffect, useMemo, useState } from "react";
import Pagination from "../../component/Pagination";
import Table from "../../component/Table";
import {
  useGetAllEmailsQuery,
  useResendAllEmailsMutation,
  useResendEmailMutation,
  useUpdateEmailMutation,
  useDeleteEmailMutation,
} from "../../redux/features/email/emailApiSlice";
import moment from "moment";
import {
  Loader,
  ReceiptText,
  RotateCcw,
  Search,
  SendHorizontal,
  Trash2,
  Edit,
  CircleAlert,
  Eye,
} from "lucide-react";
import {
  warningAlert,
  errorAlert,
  successAlert,
} from "../../utils/allertFunction";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryParams } from "../../utils/useQueryParams";
import getSchemaByRole from "../../utils/getSchemaByRole";
import { EmailModal } from "./components/email-modal";
import { EmailEditModal } from "./components/email-edit-modal";
import Button from "@/component/Button";
import Modal from "@/component/Modal";
import { CustomCheckbox } from "@/component/CustomCheckbox";
import SelectInput from "@/component/select/SelectInput";
import DateRangePicker from "@/component/DateRangePicker";
import { baseURL } from "@/constant/baseURL";
import { FloatingInput } from "@/component/FloatiingInput";
import Tooltip from "@/component/Tooltip";
import { companyEmail } from "@/constant/companyInfo";

const EmailPage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // State to manage the current page
  const [limit, setLimit] = useState(20); // State to manage items per page
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [status, setStatus] = useState(null);
  const { setQueryParam } = useQueryParams();
  const [searchParams, setSearchParams] = useSearchParams();
  // Effect to handle initial URL params
  const statusOptions = useMemo(
    () => [
      { label: "All", value: "" },
      { label: "Sent", value: "Sent" },
      { label: "Failed", value: "Failed" },
      { label: "Trash", value: "Trash" },
    ],
    []
  );

  // Effect to handle initial URL params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      const foundStatus = statusOptions.find(
        (option) => option.value === statusParam
      );
      if (foundStatus) {
        setStatus(foundStatus);
      }
    }
  }, [searchParams, statusOptions]);

  // Initial URL params effect
  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);

    // Extract searchParams values
    const search = currentParams.get("search") || "";
    const statusParam = currentParams.get("status");
    const startDateParam = currentParams.get("startDate");
    const endDateParam = currentParams.get("endDate");

    // Set search
    if (search) {
      setSearch(search);
      currentParams.set("search", search);
    }

    // Set status
    if (statusParam) {
      const selectedStatus = statusOptions.find(
        (status) => status.value === statusParam
      );
      if (selectedStatus) {
        setStatus(selectedStatus);
        currentParams.set("status", selectedStatus.value);
      }
    }

    // Set date range
    if (startDateParam || endDateParam) {
      setDateRange({
        startDate: startDateParam ? moment(startDateParam) : null,
        endDate: endDateParam ? moment(endDateParam) : null,
      });
      if (startDateParam) currentParams.set("startDate", startDateParam);
      if (endDateParam) currentParams.set("endDate", endDateParam);
    }

    // Update URL with all params
    setSearchParams(currentParams);
  }, []);

  const { data, isLoading, error, isFetching, refetch } = useGetAllEmailsQuery(
    {
      search,
      page: currentPage,
      limit,
      status: status?.value || "",
      startDate: dateRange?.startDate
        ? moment(dateRange.startDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
        : "",
      endDate: dateRange?.endDate
        ? moment(dateRange.endDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
        : "",
    },
    { refetchOnMountOrArgChange: true }
  );

  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [resendEmail, { isLoading: sendingLoader }] = useResendEmailMutation();
  const [resendAllEmails, { isLoading: allSendingLoader }] =
    useResendAllEmailsMutation();

  const user = useSelector((state) => state.userSlice.user).user;
  const [updateEmail, { isLoading: updateLoader }] = useUpdateEmailMutation();
  const [deleteEmail, { isLoading: deleteLoader }] = useDeleteEmailMutation();

  const handleResendEmail = async (id, email) => {
    try {
      await resendEmail({
        id: id,
        userId: user?._id,
        userModel: getSchemaByRole(user?.role),
      }).unwrap();
      successAlert({
        title: "Successfully Resend Email",
        text: `Successfully Resend Email to ${email} `,
      });
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      errorAlert({
        title: "Error to Resend Email",
        text: "Failed to Resend Email at ${email}",
      });
    }
  };

  const handleResendAllEmails = async () => {
    try {
      if (selectedEmails?.length !== 0) {
        await resendAllEmails({
          emailIds: selectedEmails,
          userId: user?._id,
          userModel: getSchemaByRole(user?.role),
        }).unwrap();
        successAlert({
          title: "Successfully Resend Emails",
          text: `Successfully Resend All Emails `,
        });
      } else {
        errorAlert({
          title: "Email Not Selected",
          text: "Please select the emails for sending",
        });
      }
      setSelectedEmails([]);
      refetch();
    } catch (err) {
      errorAlert({
        title: "Error to Resend All Emails",
        text: "Failed to Resend All Emails",
      });
    }
  };

  const handleTrashRequest = async (id) => {
    warningAlert({
      title: "Are you sure?",
      text: `Do you really want to add this into trash?`,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Call API to delete or move to trash
          await updateEmail({
            id: id,
            email: { status: "trash" },
            userId: user?._id,
            userModel: getSchemaByRole(user?.role),
          }).unwrap();
          refetch();
          // Success alert
          successAlert({
            title: "Success",
            text: `Email moved to trash successfully.`,
          });
        } catch (error) {
          // Handle errors and display feedback
          console.error("Error trashing email:", error);
          errorAlert({
            title: "Error",
            text: "Failed to trash email. Please try again.",
          });
        }
      }
    });

    // try {
    //     await deleteCoupon(_id).unwrap();
    //     successAlert({title: "Success", text: "Coupon deleted successfully!"});
    //     refetch()
    // } catch (error) {
    //     console.error("Error deleting coupon:", error);
    //     errorAlert({title: "Error", text: "Failed to delete the coupon"});
    // }
  };

  const handleOpenEditModal = (email) => {
    setEmail(email);
    setOpen(true);
  };

  const firstSelectedEmail = data?.emails?.find(
    (email) => email?._id === selectedEmails[0]
  );

  const handleDeleteRequest = async (id) => {
    warningAlert({
      title: "Are you sure?",
      text: `Do you really want to delete this email? This action is irreversible.`,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Call API to delete email
          await deleteEmail({
            id,
            userId: user?._id,
            userModel: getSchemaByRole(user?.role),
          }).unwrap();
          refetch();
          // Success alert
          successAlert({
            title: "Success",
            text: `Email deleted successfully.`,
          });
        } catch (error) {
          // Handle errors and display feedback
          console.error("Error deleting email:", error);
          errorAlert({
            title: "Error",
            text: "Failed to delete email. Please try again.",
          });
        }
      }
    });
  };

  const tableData = data?.emails?.map((email) => ({
    "Mail To": (
      <div className="flex gap-2">
        <CustomCheckbox
          onClick={() => {
            setSelectedEmails((prev) => {
              if (prev.includes(email?._id)) {
                return prev.filter((id) => id !== email?._id);
              } else {
                return [...prev, email?._id];
              }
            });
          }}
          className=" "
          checked={selectedEmails?.find((id) => id === email?._id)}
        />
        <Tooltip text={email?.to} position="right">
          <p>
            {(email?.sendTo ? email?.sendTo : email?.to).slice(0, 40)}
            {(email?.sendTo ? email?.sendTo : email?.to).length > 40
              ? "..."
              : ""}
          </p>
        </Tooltip>
      </div>
    ),
    Subject: <p className="cursor-pointer">{email?.subject}</p>,
    "Sent On": moment.utc(email?.date).format("MMM DD, YYYY"),
    Status: <p className="ml-4">{email?.status}</p>,
    Error: (
      <p className="text-red-500 font-semibold">
        {email?.error ? email?.error.slice(0, 5) + "..." : ""}
      </p>
    ),
    Details: (
      <Button
        variant="outline"
        className="text-primary items-center gap-1 border-primary hover:bg-primary px-3 py- rounded-md text-xs font-medium "
        onClick={() => {
          setEmail(email);
          setIsModalOpen(true);
        }}
      >
        View <Eye size={16} />
      </Button>
    ),
    Action: (
      <div className="flex gap-2 items-center">
        <Tooltip
          text={
            email.status === "trash" ? "Delete Permanently" : "Move to Trash"
          }
          position="left"
        >
          <Button
            className="rounded-full  p-2 bg-red-500 hover:bg-red-600 border-0"
            onClick={() => {
              if (email.status === "trash") {
                handleDeleteRequest(email?._id);
              } else {
                handleTrashRequest(email?._id);
              }
            }}
          >
            <Trash2 size={16} className="text-white" />
          </Button>
        </Tooltip>
      </div>
    ),
  }));

  return (
    <div className="mx-auto  px-4 sm:px-32 ">
      <div className="max-w-screen-2xl mx-auto">
        <div className="lg:flex space-y-2 lg:space-y-0 mt-16 justify-between items-center">
          <h2 className="text-2xl flex gap-2 font-semibold ">
            Email Reports
            <Tooltip
              content="View the history of all system-generated emails, including delivery status, send date, and recipient details. "
              position="right"
            >
              <span className="pt-2 text-gray-600 cursor-pointer">
                <CircleAlert size={18} />
              </span>
            </Tooltip>
          </h2>
          {/* <div className="flex gap-2">
            <Button
              disabled={allSendingLoader || selectedEmails.length === 0}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white border-0 px-6 py-2"
              onClick={() => handleResendAllEmails()}
            >
              {allSendingLoader ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <SendHorizontal size={18} />
              )}
              RESEND SELECTED EMAILS
              {selectedEmails.length > 0 && ` ▶`}
            </Button>
          </div> */}
        </div>

        <div className="flex flex-wrap gap-4 mt-6 mb-6 items-end">
          <div className="w-full lg:w-auto lg:flex-1">
            <FloatingInput
              label="Search emails"
              value={search}
              icon={<Search size={18} className="text-gray-400" />}
              onChange={async (e) => {
                setSearch(e.target.value);
                setQueryParam("search", e.target.value);
                await setCurrentPage(1);
              }}
            />
          </div>

          <div className="w-full sm:w-[240px]">
            <SelectInput
              id="status-select"
              label="Select status"
              isMulti={false}
              value={status}
              onChange={async (selected) => {
                await setCurrentPage(1);
                setStatus(selected);
                const newParams = new URLSearchParams(searchParams);
                if (selected?.value) {
                  newParams.set("status", selected.value);
                } else {
                  newParams.delete("status");
                }
                setSearchParams(newParams);
              }}
              options={statusOptions}
              className="min-w-[180px]"
            />
          </div>

          <div className="w-full sm:w-[280px]">
            <DateRangePicker
              value={dateRange}
              onChange={async (newValue) => {
                await setCurrentPage(1);
                setDateRange({
                  startDate: newValue.startDate
                    ? new Date(newValue.startDate)
                    : null,
                  endDate: newValue.endDate ? new Date(newValue.endDate) : null,
                });

                const newParams = new URLSearchParams(searchParams);
                const startDate = newValue?.startDate
                  ? moment(newValue?.startDate)
                      .startOf("day")
                      .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
                  : "";
                const endDate = newValue?.endDate
                  ? moment(newValue?.endDate)
                      .endOf("day")
                      .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
                  : "";

                if (startDate) {
                  newParams.set("startDate", startDate);
                } else {
                  newParams.delete("startDate");
                }
                if (endDate) {
                  newParams.set("endDate", endDate);
                } else {
                  newParams.delete("endDate");
                }

                setSearchParams(newParams);
              }}
              showShortcuts={true}
              placeholder="Select date range"
              containerClassName="z-30 relative"
              inputClassName="w-full border border-gray-300 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-md"
            />
          </div>

          <div className="flex-shrink-0">
            <Tooltip position="top" text="Reset all filters">
              <Button
                variant="reset"
                onClick={() => {
                  setDateRange({
                    startDate: null,
                    endDate: null,
                  });
                  setStatus(null);
                  setSearch("");
                  const newParams = new URLSearchParams();
                  setSearchParams(newParams);
                }}
                className="h-[42px] px-4 py-2"
              >
                <RotateCcw size={18} className="mr-1" /> Reset
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <CustomCheckbox
              onClick={async () => {
                if (selectedEmails.length === data?.emails?.length) {
                  setSelectedEmails([]);
                } else {
                  setSelectedEmails(data?.emails?.map((email) => email?._id));
                }
              }}
              className="scale-110"
              checked={
                selectedEmails?.length === data?.emails?.length &&
                data?.emails?.length > 0
              }
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h3 className="text-base font-semibold text-gray-800">
                Select All
              </h3>
              {data?.emails?.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({selectedEmails?.length}/{data?.emails?.length} selected)
                </span>
              )}
            </div>
          </div>

          {selectedEmails?.length !== 0 && user?.role !== "Support Agent" && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => handleResendAllEmails()}
                disabled={allSendingLoader}
                className="flex items-center justify-center gap-2 text-primary border-primary hover:bg-primary px-4 py-2"
              >
                {allSendingLoader ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <SendHorizontal size={16} />
                )}
                <span className="whitespace-nowrap">
                  Resend Selected ({selectedEmails?.length})
                </span>
              </Button>

              <Button
                onClick={async () => {
                  if (selectedEmails.length === 0) return;

                  const result = await warningAlert({
                    title: "Are you sure?",
                    text: `You are about to ${
                      firstSelectedEmail?.status === "trash"
                        ? "permanently delete"
                        : "move to trash"
                    } ${selectedEmails.length} email(s).`,
                    confirmButtonText:
                      firstSelectedEmail?.status === "trash"
                        ? "Yes, delete"
                        : "Yes, move to trash",
                    cancelButtonText: "No, cancel",
                  });

                  if (result.isConfirmed) {
                    try {
                      if (firstSelectedEmail?.status === "trash") {
                        // Permanent delete all selected emails
                        await Promise.all(
                          selectedEmails.map(async (id) => {
                            await deleteEmail({
                              id,
                              userId: user?._id,
                              userModel: getSchemaByRole(user?.role),
                            });
                          })
                        );
                      } else {
                        // Move all selected emails to trash
                        await Promise.all(
                          selectedEmails.map(async (id) => {
                            await updateEmail({
                              id,
                              email: { status: "trash" },
                              userId: user?._id,
                              userModel: getSchemaByRole(user?.role),
                            }).unwrap();
                          })
                        );
                      }

                      refetch();
                      successAlert({
                        title:
                          firstSelectedEmail?.status === "trash"
                            ? "Deleted!"
                            : "Moved to Trash!",
                        text: `${selectedEmails.length} email(s) have been ${
                          firstSelectedEmail?.status === "trash"
                            ? "deleted"
                            : "moved to Trash"
                        }.`,
                      });

                      setSelectedEmails([]);
                    } catch (error) {
                      console.error("Error:", error);
                      errorAlert({
                        title: "Error",
                        text: "Something went wrong. Please try again!",
                      });
                    }
                  }
                }}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white border-0 px-4 py-2"
              >
                <Trash2 size={16} />
                <span className="whitespace-nowrap">
                  {firstSelectedEmail?.status === "trash" ? "Delete" : "Trash"}{" "}
                  ({selectedEmails?.length})
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Table
          isLoading={isFetching}
          data={tableData}
          columns={[
            "Mail To",
            "Subject",
            "Sent On",
            "Status",
            "Error",
            "Details",
            "Action",
          ]}
        />

        {tableData?.length !== 0 && (
          <div className="w-full mt-8 mx-auto max-w-screen-md flex justify-center">
            <Pagination
              currentCount={tableData?.length || 0}
              totalCount={data?.totalCount}
              setLimit={setLimit}
              limit={limit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
      {isModalOpen && (
        <Modal
          className="p-6 pt-0  pb-0 max-w-2xl"
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          {" "}
          <div className="h-6 bg-white sticky top-0">
            <p></p>
          </div>
          <div
            style={{
              boxShadow:
                "rgba(50, 50, 93, 0.25) 0px 5px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
            }}
            className="p-6 rounded-lg "
          >
            <div className="rounded-lg mt-5 mb-7 font-semibold space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Date:</span>{" "}
                  {moment.utc(email?.date).format("MMM DD, YYYY")}
                </div>
                <div>
                  <span className="text-gray-600">Time:</span>{" "}
                  {moment.utc(email?.date).utcOffset(-6).format("hh:mm A")}
                </div>
                <div>
                  <span className="text-gray-600">From:</span> {companyEmail}
                </div>
                <div>
                  <span className="text-gray-600">To:</span> {email?.to}
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-600">Subject:</span>{" "}
                  {email?.subject}
                </div>
              </div>
              {email?.fileName && (
                <div className="pt-3 border-t">
                  <Link
                    to={`${baseURL}/utils/invoices/${email?.fileName}`}
                    target="_blank"
                  >
                    <Button variant="outline" className="w-full md:w-auto">
                      <ReceiptText size={16} className="mr-2" />
                      View Attachment (PDF)
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">
                Email Content:
              </h4>
              <div
                className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg border overflow-auto max-h-96"
                dangerouslySetInnerHTML={{ __html: email?.body }}
              />
            </div>
          </div>
          {/* Add a button to close the modal */}
          <div className="flex py-4 justify-center sticky bottom-0 bg-white gap-3 mx-auto">
            <Button
              variant="outline"
              className="w-40 border-gray-300 text-gray-700 hover:bg-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
            <Button
              disabled={sendingLoader}
              className="text-nowrap w-40 bg-primary hover:bg-primary/90 text-white border-0"
              onClick={() => handleResendEmail(email?._id, email?.to)}
            >
              Resend Email{" "}
              {sendingLoader ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <SendHorizontal size={18} />
              )}
            </Button>
          </div>
        </Modal>
      )}
      <EmailEditModal
        email={email}
        open={open}
        setOpen={setOpen}
        refetch={refetch}
      />
    </div>
  );
};

export default EmailPage;
