import Button from "@/component/Button";
import { FloatingInput } from "@/component/FloatiingInput";
import { relationOptions } from "./const";
import { TitleDivider } from "@/component/TitleDevider";
import { toast } from "@/component/Toast";
import SelectInput from "@/component/select/SelectInput";

const FamilyMembers = ({ formData, setFormData, isAdmin }) => {
  const handleFamilyMemberChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newFamilyMembers = [...prevData.familyMembers];
      newFamilyMembers[index] = {
        ...newFamilyMembers[index],
        [name]: value,
      };
      return {
        ...prevData,
        familyMembers: newFamilyMembers,
      };
    });
  };

  const validateAllFamilyMembers = () => {
    for (const member of formData?.familyMembers) {
      if (
        member.name.trim() === "" ||
        member.relation.trim() === "" ||
        member.phone.trim() === ""
      ) {
        return false; // Found an empty name or relation
      }
    }
    return true; // All names are filled
  };

  const addFamilyMember = () => {
    if (validateAllFamilyMembers()) {
      setFormData((prevData) => ({
        ...prevData,
        familyMembers: [
          ...prevData.familyMembers,
          { name: "", email: "", phone: "", address: "", relation: "" },
        ],
      }));
    } else {
      toast.error(
        "Field Required",
        "Please fill in the 'Name', 'Relation', and 'Phone' for all existing family members before adding another."
      );
    }
  };

  const deleteFamilyMember = (index) => {
    setFormData((prevData) => {
      const newFamilyMembers = prevData.familyMembers.filter(
        (_, i) => i !== index
      );
      return {
        ...prevData,
        familyMembers: newFamilyMembers,
      };
    });
  };

  return (
    <div>
      <TitleDivider
        color="primary"
        className={"text-gray-900"}
        title="Family Members"
      />

      <form className="space-y-6">
        {formData?.familyMembers?.map((member, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-6 space-y-4 relative"
          >
            {index > 0 && (
              <button
                type="button"
                onClick={() => deleteFamilyMember(index)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                aria-label={`Delete family member ${index + 1}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
            <h3 className="text-xl font-medium text-gray-700">
              Family Member {index + 1}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingInput
                label="Name"
                name="name"
                value={member.name}
                onChange={(e) => handleFamilyMemberChange(index, e)}
                required={!isAdmin}
              />
              <SelectInput
                label="Relation"
                name="relation"
                value={
                  relationOptions.find(
                    (opt) => opt.value === member.relation
                  ) || null
                }
                onChange={(option) =>
                  handleFamilyMemberChange(index, {
                    target: { name: "relation", value: option?.value || "" },
                  })
                }
                options={relationOptions}
                required={!isAdmin}
              />
              <FloatingInput
                label="Email"
                name="email"
                type="email"
                value={member.email}
                onChange={(e) => handleFamilyMemberChange(index, e)}
              />
              <FloatingInput
                label="Phone"
                name="phone"
                type="tel"
                value={member.phone}
                onChange={(e) => handleFamilyMemberChange(index, e)}
                required={!isAdmin}
              />
            </div>
            <FloatingInput
              label="Address"
              name="address"
              value={member.address}
              onChange={(e) => handleFamilyMemberChange(index, e)}
            />
          </div>
        ))}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={addFamilyMember}
            className="rounded-md"
          >
            Add More Family Member
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FamilyMembers;
