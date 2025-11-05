import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import Modal from "@/component/Modal";
import Pagination from "@/component/Pagination";
import SelectInput from "@/component/select/SelectInput";
import Table from "@/component/Table";
import { toast } from "@/component/Toast";
import Tooltip from "@/component/Tooltip";
import {
  useDecreaseConsumableProductMutation,
  useGetConsumableItemsQuery,
} from "@/redux/features/inventory/inventoryApiSlice";
import { HandCoins } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const ConsumableItemsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  console.log(selectedItem);

  const loginUser = useSelector((state) => state.userSlice.user)

  const {
    data: consumableItems,
    isLoading,
    isFetching,
  } = useGetConsumableItemsQuery({
    page: page,
    limit: limit,
    search: searchTerm,
    status: selectedStatus?.value || "",
  });
  console.log(consumableItems);

  const [decreaseConsumableProduct, { isLoading: isUsing }] =
    useDecreaseConsumableProductMutation();

  const tableData = useMemo(() => {
    if (!consumableItems?.data) return [];
    return consumableItems?.data?.map((item) => ({
      "Item Name": item?.type?.name,
      Total: item.quantity || "0",
      Available: item.quantity - (item?.usedQuantity + item?.unUseableQuantity + item?.underMaintenanceQuantity) || "0",
      Used: item.usedQuantity || "0",
      Unusable: item.unUseableQuantity || "0",
      "Under Maintenance": item.underMaintenanceQuantity || "0",
      Status: item?.type?.status || "Unknown",
      Actions: (
        <div className="flex items-center space-x-2">
          <Tooltip text={"Add Item Usage"} position="left">
            <button
              onClick={() => {
                setIsUsageModalOpen(true)
                setSelectedItem(item)
              }}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="View Details"
            >
              <HandCoins size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    }));
  }, [consumableItems]);

  const columns = [
    "Item Name",
    "Total",
    "Available",
    "Used",
    "Unusable",
    "Under Maintenance",
    "Status",
    "Actions",
  ];

  const handleSubmit = async () => {

    try {
      const submitData = {
      quantity: Number(quantity),
      userId: loginUser?.user?._id
    }

    await decreaseConsumableProduct({ typeId: selectedItem?.type?._id, body: submitData }).unwrap();

    setIsUsageModalOpen(false);
    setQuantity("");
    toast.success("Consumable product usage added successfully!");

    } catch (error) {
      console.error("Error decreasing consumable product:", error);
      toast.error("Failed", error?.data?.error || "Failed to add consumable product usage");
    }

    
  };

  return (
    <div className="p-4 md:pl-24 pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Consumable Items Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage consumable items in your inventory
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <FloatingInput
          label="Search Items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />

        <SelectInput
          label="Filter by Status"
          options={[
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
          value={selectedStatus}
          onChange={setSelectedStatus}
          className="mt-[-2px]"
        />

        {/* <div className="flex items-end w-32">
          <Button
            variant="primary"
            onClick={() => {
              //   setSearchTerm("");
              //   setSelectedStatus(statusOptions[0]);
              //   setSelectedType(null);
              //   setPage(1);
            }}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div> */}
      </div>

      {/* Products Table */}
      <div className="">
        <Table
          columns={columns}
          data={tableData}
          isLoading={isLoading || isFetching}
          emptyMessage="No items found"
        />

        {/* Pagination */}
        {tableData.length > 0 && (
          <div className="mt-6 px-4 sm:px-0">
            <Pagination
              totalCount={consumableItems?.pagination?.totalCount || 0}
              currentPage={page}
              setCurrentPage={setPage}
              limit={limit}
              setLimit={setLimit}
            />
          </div>
        )}
      </div>

      <Modal
        onClose={() => {
          setIsUsageModalOpen(false);
          setQuantity("");
        }}
        open={isUsageModalOpen}
        className="max-w-lg"
      >
        <div className=" p-6 space-y-5">
          <h2 className="text-xl font-semibold">
            Add Item Usage ({selectedItem?.type?.name}) <span></span>Available: {selectedItem ? selectedItem.quantity - (selectedItem?.usedQuantity + selectedItem?.unUseableQuantity + selectedItem?.underMaintenanceQuantity) : 0}
          </h2>

            <FloatingInput
              label="Usage Quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                if((e.target.value > selectedItem.quantity - (selectedItem?.usedQuantity + selectedItem?.unUseableQuantity + selectedItem?.underMaintenanceQuantity)) || e.target.value < 0) {
                  return;
                }
                setQuantity(e.target.value);
              }}
              
            />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={() => {
                setIsUsageModalOpen(false);
                setQuantity("");
              }}
              className="bg-gray-500 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUsing || !quantity}
              onClick={handleSubmit}
              className="rounded-lg"
              size="sm"
            >
              <span>{isUsing ? "Adding..." : "Add Usage"}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConsumableItemsPage;
