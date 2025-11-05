import PModal from "./PModal";
import DynamicForm from "./DynamicForm";

const ReusableFormModal = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  fields,
  initialValues,
  submitText,
  validate, // <-- added
}) => {
  return (
    <PModal isOpen={isOpen} title={title} onClose={onClose}>
      <DynamicForm
        fields={fields}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitText={submitText}
        validate={validate} // <-- pass through
      />
    </PModal>
  );
};

export default ReusableFormModal;
