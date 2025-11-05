import { FloatingInput } from "@/component/FloatiingInput";
import { TitleDivider } from "@/component/TitleDevider";
import { Hash, Landmark, Split, MapPinned } from "lucide-react";

const BankInformation = ( { formData, handleChange, errors }) => {
  return (
    <div>
      <TitleDivider
        color="primary"
        className={"text-gray-900"}
        title="Bank Information"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-black">
              <FloatingInput
                label="Bank Name"
                type="text"
                name="bankInfo.bankName"
                value={formData.bankInfo.bankName}
                onChange={handleChange}
                error={errors["bankInfo.bankName"]}
                icon={<Landmark className="h-5 w-5" />}
              />
              <FloatingInput
                label="Account Number"
                type="text"
                name="bankInfo.accountNumber"
                value={formData.bankInfo.accountNumber}
                onChange={handleChange}
                error={errors["bankInfo.accountNumber"]}
                icon={<Hash className="h-5 w-5" />}
              />
              <FloatingInput
                label="Branch Name"
                type="text"
                name="bankInfo.branchName"
                value={formData.bankInfo.branchName}
                onChange={handleChange}
                error={errors["bankInfo.branchName"]}
                icon={<Split className="h-5 w-5" />}
              />
              <FloatingInput
                label="Routing Number"
                type="text"
                name="bankInfo.routingNumber"
                value={formData.bankInfo.routingNumber}
                onChange={handleChange}
                error={errors["bankInfo.routingNumber"]}
                icon={<MapPinned className="h-5 w-5" />}
              />
        </div>
    </div>
  );
};

export default BankInformation;
