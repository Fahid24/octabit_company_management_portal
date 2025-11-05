import Modal from '@/component/Modal';
import LearningRequestForm from './LearningRequestForm';

export default function LearningRequestCreateModal({ open, onClose, onSuccess }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Create Education Request">
      <div className='max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4'>
        <LearningRequestForm onSuccess={onSuccess} />
      </div>
    </Modal>
  );
} 