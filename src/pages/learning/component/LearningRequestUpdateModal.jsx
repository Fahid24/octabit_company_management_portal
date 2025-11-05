import Modal from '@/component/Modal';
import LearningRequestForm from './LearningRequestForm';

export default function LearningRequestUpdateModal({ open, onClose, request, onSuccess }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Update Learning Request">
      <LearningRequestForm open={open} existingRequest={request} onSuccess={onSuccess} />
    </Modal>
  );
} 