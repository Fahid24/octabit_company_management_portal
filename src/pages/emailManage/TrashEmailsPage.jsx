import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  CircleAlert,
  Eye,
  Loader,
  ReceiptText,
  RotateCcw,
  Search,
  SendHorizontal,
  Trash2,
} from 'lucide-react';
import {
  useDeleteEmailMutation,
  useGetAllEmailsQuery,
  useResendAllEmailsMutation,
  useResendEmailMutation,
  useUpdateEmailMutation,
} from '@/redux/features/email/emailApiSlice';
import {
  warningAlert,
  errorAlert,
  successAlert,
} from '../../utils/allertFunction';
import { useQueryParams } from '../../utils/useQueryParams';
import getSchemaByRole from '../../utils/getSchemaByRole';
import { baseURL } from '@/constant/baseURL';
import { FloatingInput } from '@/component/FloatiingInput';
import { CustomCheckbox } from '@/component/CustomCheckbox';
import Tooltip from '@/component/Tooltip';
import Button from '@/component/Button';
import Modal from '@/component/Modal';
import DateRangePicker from '@/component/DateRangePicker';
import Table from '@/component/Table';
import Pagination from '@/component/Pagination';
import { EmailEditModal } from './components/email-edit-modal';

export default function TrashEmailsPage() {
  // State management
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [open, setOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Hooks
  const { setQueryParam } = useQueryParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((state) => state.userSlice.user).user;

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    setSearch(search);
    if (startDateParam) {
      setStartDate(moment(startDateParam, 'YYYY-MM-DD'));
    }
    if (endDateParam) {
      setEndDate(moment(endDateParam, 'YYYY-MM-DD'));
    }
  }, [searchParams]);

  const [resendEmail, { isLoading: sendingLoader }] = useResendEmailMutation();
  const [resendAllEmails, { isLoading: allSendingLoader }] =
    useResendAllEmailsMutation();

  const [updateEmail, { isLoading: updateLoader }] = useUpdateEmailMutation();
  const [deleteEmail, { isLoading: deleteLoader }] = useDeleteEmailMutation();

  const { data, isLoading, error, isFetching, refetch } = useGetAllEmailsQuery(
    {
      search,
      page: currentPage,
      limit,
      status: 'trash',
      startDate: startDate ? startDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : '',
      endDate: endDate ? endDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : '',
    },
    { refetchOnMountOrArgChange: true }
  );

  const handleResendEmail = async (id, email) => {
    try {
      await resendEmail({
        id: id,
        userId: user?._id,
        userModel: getSchemaByRole(user?.role),
      }).unwrap();
      successAlert({
        title: 'Successfully Resend Email',
        text: `Successfully Resend Email to ${email} `,
      });
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      errorAlert({
        title: 'Error to Resend Email',
        text: 'Failed to Resend Email at ${email}',
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
          title: 'Successfully Resend Emails',
          text: `Successfully Resend All Emails `,
        });
      } else {
        errorAlert({
          title: 'Email Not Selected',
          text: 'Please select the emails for sending',
        });
      }
      setSelectedEmails([]);
      refetch();
    } catch (err) {
      errorAlert({
        title: 'Error to Resend All Emails',
        text: 'Failed to Resend All Emails',
      });
    }
  };

  const handleTrashRequest = async (id) => {
    warningAlert({
      title: 'Are you sure?',
      text: `Do you really want to add this into trash?`,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // // Call API to delete coupon
          await updateEmail({
            id: id,
            email: { status: 'trash' },
            userId: user?._id,
            userModel: getSchemaByRole(user?.role),
          }).unwrap();
          refetch();
          // Success alert
          successAlert({
            title: 'Success',
            text: `Email Trashed successfully.`,
          });
        } catch (error) {
          // Handle errors and display feedback
          console.error('Error trashing email:', error);
          errorAlert({
            title: 'Error',
            text: 'Failed to trash email Please try again.',
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
      title: 'Are you sure?',
      text: `Do you really want to delete this email? This action is irreversible.`,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
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
            title: 'Success',
            text: `Email Deleted successfully.`,
          });
        } catch (error) {
          // Handle errors and display feedback
          console.error('Error deleting email:', error);
          errorAlert({
            title: 'Error',
            text: 'Failed to delete email Please try again.',
          });
        }
      }
    });
  };

  const tableData = data?.emails?.map((email) => ({
    'Mail To': (
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
          className="scale-125  "
          checked={selectedEmails?.find((id) => id === email?._id)}
        />
        <p>{email?.to}</p>
      </div>
    ),
    Subject: <p className="cursor-pointer">{email?.subject}</p>,
    'Sent On': moment.utc(email?.date).format('MMM DD, YYYY'),
    Status: <p className="ml-4">{email?.status}</p>,
    Error: (
      <p className="text-red-500 font-semibold">
        {email?.error ? email?.error.slice(0, 5) + '...' : ''}
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
        {/* <Tooltip content="Edit" position="left">
          <Button
            variant="outline"
            className="rounded-full max-h-12 max-w-12 w-10 h-10 p-3"
            onClick={() => handleOpenEditModal(email)}
          >
            <Edit size={20} />
          </Button>
        </Tooltip> */}

        {email.status === 'sent' || email.status === 'failed' ? (
          <Tooltip content="Trash" position="left">
            <Button
              className="rounded-full bg-red-600  p-3"
              variant="danger"
              onClick={() => {
                handleTrashRequest(email?._id);
              }}
            >
              <Trash2 size={20} />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip text="Delete" position="left">
            <Button
              className="rounded-full bg-red-600 hover:bg-gray-600 text-white"
              variant="danger"
              onClick={() => {
                handleDeleteRequest(email?._id);
                // console.log('Delete email with ID:', email);
              }}
            >
              <Trash2 size={18} />
            </Button>
          </Tooltip>
        )}
      </div>
    ),
  }));
  return (
    <>
      <div className="mx-auto px-4 sm:px-32">
        <div className="max-w-screen-2xl mx-auto">
          {/* Header Section */}
          <div className="lg:flex space-y-2 lg:space-y-0 mt-16 justify-between items-center">
            <h2 className="text-2xl flex gap-2 font-semibold">
              Trashed Emails
              <Tooltip
                text="View emails that were deleted from the system. These may include failed deliveries, user-deleted items, or outdated notifications."
                position="right"
              >
                <span className="pt-2 text-gray-600 cursor-pointer">
                  <CircleAlert size={18} />
                </span>
              </Tooltip>
            </h2>
          </div>

          {/* Search and Filters */}
          <div className="flex justify-between  gap-4 mt-6 mb-6 items-end">
            <div className="w-full lg:w-auto max-w-96 lg:flex-1">
              <FloatingInput
                label="Search emails"
                value={search}
                icon={<Search size={18} className="text-gray-400" />}
                onChange={async (e) => {
                  setSearch(e.target.value);
                  setQueryParam('search', e.target.value);
                  await setCurrentPage(1);
                }}
              />
            </div>
            <div className='flex gap-4 justify-self-end'>
              <div className='min-w-60'>
                <DateRangePicker
                  primaryColor="green"
                  value={{ startDate, endDate }}
                  onChange={async (newValue) => {
                    await setCurrentPage(1);
                    const newStartDate = newValue.startDate ? moment(newValue.startDate) : null;
                    const newEndDate = newValue.endDate ? moment(newValue.endDate) : null;

                    setStartDate(newStartDate);
                    setEndDate(newEndDate);

                    const newParams = new URLSearchParams(searchParams);
                    if (newStartDate) {
                      newParams.set('startDate', newStartDate.format('YYYY-MM-DD'));
                    } else {
                      newParams.delete('startDate');
                    }
                    if (newEndDate) {
                      newParams.set('endDate', newEndDate.format('YYYY-MM-DD'));
                    } else {
                      newParams.delete('endDate');
                    }

                    setSearchParams(newParams);
                  }}
                  showShortcuts={true}
                  toggleClassName=""
                  containerClassName={`z-30 relative w-full`}
                  inputClassName="border py-2 px-4 w-full md:min-w-72 border-gray-300 rounded-md"
                />
              </div>
              <Tooltip position="bottom" content="Reset filter">
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setSearch('');
                    // Clear URL parameters
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('startDate');
                    newParams.delete('endDate');
                    newParams.delete('search');
                    setSearchParams(newParams);
                  }}
                  className="bg-primary  py-2 px-3 rounded-lg flex justify-center items-center text-white"
                >
                  <RotateCcw />
                </button>
              </Tooltip>
            </div>


          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between sm:mt-10 ml-12">
            <div className="flex items-center gap-2 ml-12">
              <CustomCheckbox
                onClick={() => {
                  if (selectedEmails.length === data?.emails?.length) {
                    setSelectedEmails([]);
                  } else {
                    setSelectedEmails(data?.emails?.map((email) => email?._id));
                  }
                }}
                className="scale-150"
                checked={selectedEmails?.length === data?.emails?.length}
              />
              <h3 className="text-lg font-semibold uppercase">Select All</h3>
            </div>

            {selectedEmails?.length !== 0 && (
              <div>
                <button
                  onClick={async () => {
                    if (selectedEmails.length === 0) return;

                    const result = await warningAlert({
                      title: 'Are you sure?',
                      text: `You are about to permanently delete ${selectedEmails.length} email(s).`,
                      confirmButtonText: 'Yes, delete',
                      cancelButtonText: 'No, cancel',
                    });

                    if (result.isConfirmed) {
                      try {
                        // Delete all selected emails permanently
                        await Promise.all(
                          selectedEmails.map(async (id) => {
                            await deleteEmail({
                              id,
                              userId: user?._id,
                              userModel: getSchemaByRole(user?.role),
                            });
                          })
                        );

                        refetch();
                        successAlert({
                          title: 'Deleted!',
                          text: `${selectedEmails.length} email(s) have been permanently deleted.`,
                        });

                        setSelectedEmails([]);
                      } catch (error) {
                        console.error('Error:', error);
                        errorAlert({
                          title: 'Error',
                          text: 'Something went wrong. Please try again!',
                        });
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                >
                  <Trash2 size={18} />
                  Delete ({selectedEmails?.length})
                </button>
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="mt-8">
            <Table
              isLoading={isFetching}
              data={tableData}
              columns={[
                'Mail To',
                'Subject',
                'Sent On',
                'Status',
                'Error',
                'Details',
                'Action',
              ]}
            />

            {tableData?.length !== 0 && (
              <div className="w-full mt-6 mx-auto max-w-screen-md flex justify-center">
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
        </div>
      </div>

      {/* Email Detail Modal */}
      {isModalOpen && (
        <Modal
          className="p-6 pt-0 pb-0 max-w-2xl"
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="h-6 bg-white sticky top-0">
            <p></p>
          </div>
          <div
            style={{
              boxShadow:
                'rgba(50, 50, 93, 0.25) 0px 5px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset',
            }}
            className="p-6 rounded-lg"
          >
            <div className="rounded-lg mt-5 mb-7 font-semibold space-y-1">
              <p>Date: {moment.utc(email?.date).format('MMM DD, YYYY')}</p>
              <p>
                Time: {moment.utc(email?.date).utcOffset(-6).format('hh:mm A')}
              </p>
              <p>From: noreplay@optimalmd.com</p>
              <p>To: {email?.to}</p>
              <p>Subject: {email?.subject}</p>
              {email?.fileName && (
                <p className="pt-5">
                  <Link
                    to={`${baseURL}/utils/invoices/${email?.fileName}`}
                    target="_blank"
                  >
                    <Button className="mx-auto">See Invoice/PDF</Button>
                  </Link>
                </p>
              )}
            </div>
            <div dangerouslySetInnerHTML={{ __html: email?.body }} />
          </div>
          <div className="flex py-4 justify-center sticky bottom-0 bg-white gap-3 mx-auto">
            <Button className="w-40" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button
              disabled={sendingLoader}
              className="text-nowrap w-40"
              onClick={() => handleResendEmail(email?._id, email?.to)}
            >
              Resend Email{' '}
              {sendingLoader ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <SendHorizontal size={18} />
              )}
            </Button>
          </div>
        </Modal>
      )}

      {/* Email Edit Modal */}
      {open && (
        <EmailEditModal
          email={email}
          open={open}
          setOpen={setOpen}
          refetch={refetch}
        />
      )}
    </>
  );

  return (
    <>
      <div className="mx-auto px-4 sm:px-32">
        <div className="max-w-screen-2xl mx-auto">
          {/* Header Section */}
          <div className="lg:flex space-y-2 lg:space-y-0 mt-16 justify-between items-center">
            <h2 className="text-2xl flex gap-2 font-semibold">
              Trashed Emails
              <Tooltip
                text="View emails that were deleted from the system. These may include failed deliveries, user-deleted items, or outdated notifications."
                position="right"
              >
                <span className="pt-2 text-gray-600 cursor-pointer">
                  <CircleAlert size={18} />
                </span>
              </Tooltip>
            </h2>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mt-6 mb-6 items-end">
            <div className="w-full lg:w-auto lg:flex-1">
              <FloatingInput
                label="Search emails"
                value={search}
                icon={<Search size={18} className="text-gray-400" />}
                onChange={async (e) => {
                  setSearch(e.target.value);
                  setQueryParam('search', e.target.value);
                  await setCurrentPage(1);
                }}
              />
            </div>

            <DateRangePicker
              primaryColor="green"
              value={{ startDate, endDate }}
              onChange={async (newValue) => {
                await setCurrentPage(1);
                const newStartDate = newValue.startDate ? moment(newValue.startDate) : null;
                const newEndDate = newValue.endDate ? moment(newValue.endDate) : null;

                setStartDate(newStartDate);
                setEndDate(newEndDate);

                const newParams = new URLSearchParams(searchParams);
                if (newStartDate) {
                  newParams.set('startDate', newStartDate.format('YYYY-MM-DD'));
                } else {
                  newParams.delete('startDate');
                }
                if (newEndDate) {
                  newParams.set('endDate', newEndDate.format('YYYY-MM-DD'));
                } else {
                  newParams.delete('endDate');
                }

                setSearchParams(newParams);
              }}
              showShortcuts={true}
              toggleClassName=""
              containerClassName={`z-30 relative w-full`}
              inputClassName="border py-2 px-4 w-full md:min-w-72 border-gray-300 rounded-md"
            />

            <Tooltip position="bottom" content="Reset filter">
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setSearch('');
                  // Clear URL parameters
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('startDate');
                  newParams.delete('endDate');
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
                className="bg-primary py-2 px-3 rounded-lg flex justify-center items-center text-white"
              >
                <RotateCcw />
              </button>
            </Tooltip>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between sm:mt-10 ml-12">
            <div className="flex items-center gap-2 ml-12">
              <CustomCheckbox
                onClick={() => {
                  if (selectedEmails.length === data?.emails?.length) {
                    setSelectedEmails([]);
                  } else {
                    setSelectedEmails(data?.emails?.map((email) => email?._id));
                  }
                }}
                className="scale-150"
                checked={selectedEmails?.length === data?.emails?.length}
              />
              <h3 className="text-lg font-semibold uppercase">Select All</h3>
            </div>

            {selectedEmails?.length !== 0 && (
              <div>
                <button
                  onClick={async () => {
                    if (selectedEmails.length === 0) return;

                    const result = await warningAlert({
                      title: 'Are you sure?',
                      text: `You are about to permanently delete ${selectedEmails.length} email(s).`,
                      confirmButtonText: 'Yes, delete',
                      cancelButtonText: 'No, cancel',
                    });

                    if (result.isConfirmed) {
                      try {
                        // Delete all selected emails permanently
                        await Promise.all(
                          selectedEmails.map(async (id) => {
                            await deleteEmail({
                              id,
                              userId: user?._id,
                              userModel: getSchemaByRole(user?.role),
                            });
                          })
                        );

                        refetch();
                        successAlert({
                          title: 'Deleted!',
                          text: `${selectedEmails.length} email(s) have been permanently deleted.`,
                        });

                        setSelectedEmails([]);
                      } catch (error) {
                        console.error('Error:', error);
                        errorAlert({
                          title: 'Error',
                          text: 'Something went wrong. Please try again!',
                        });
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                >
                  <Trash2 size={18} />
                  Delete ({selectedEmails?.length})
                </button>
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="mt-8">
            <Table
              isLoading={isFetching}
              data={tableData}
              columns={[
                'Mail To',
                'Subject',
                'Sent On',
                'Status',
                'Error',
                'Details',
                'Action',
              ]}
            />

            {tableData?.length !== 0 && (
              <div className="w-full mt-6 mx-auto max-w-screen-md flex justify-center">
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
        </div>
      </div>

      {/* Email Detail Modal */}
      {isModalOpen && (
        <Modal
          className="p-6 pt-0 pb-0 max-w-2xl"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="h-6 bg-white sticky top-0">
            <p></p>
          </div>
          <div
            style={{
              boxShadow:
                'rgba(50, 50, 93, 0.25) 0px 5px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset',
            }}
            className="p-6 rounded-lg"
          >
            <div className="rounded-lg mt-5 mb-7 font-semibold space-y-1">
              <p>Date: {moment.utc(email?.date).format('MMM DD, YYYY')}</p>
              <p>
                Time: {moment.utc(email?.date).utcOffset(-6).format('hh:mm A')}
              </p>
              <p>From: noreplay@optimalmd.com</p>
              <p>To: {email?.to}</p>
              <p>Subject: {email?.subject}</p>
              {email?.fileName && (
                <p className="pt-5">
                  <Link
                    to={`${baseURL}/utils/invoices/${email?.fileName}`}
                    target="_blank"
                  >
                    <Button className="mx-auto">See Invoice/PDF</Button>
                  </Link>
                </p>
              )}
            </div>
            <div dangerouslySetInnerHTML={{ __html: email?.body }} />
          </div>
          <div className="flex py-4 justify-center sticky bottom-0 bg-white gap-3 mx-auto">
            <Button className="w-40" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button
              disabled={sendingLoader}
              className="text-nowrap w-40"
              onClick={() => handleResendEmail(email?._id, email?.to)}
            >
              Resend Email{' '}
              {sendingLoader ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <SendHorizontal size={18} />
              )}
            </Button>
          </div>
        </Modal>
      )}

      {/* Email Edit Modal */}
      {open && (
        <EmailEditModal
          email={email}
          open={open}
          setOpen={setOpen}
          refetch={refetch}
        />
      )}
    </>
  );
}

