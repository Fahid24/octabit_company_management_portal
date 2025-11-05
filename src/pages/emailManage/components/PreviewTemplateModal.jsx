import Button from '@/component/Button'
import Modal from '@/component/Modal'

const PreviewTemplateModal = ({ isModalOpen, setIsModalOpen, previewTemplate, setPreviewTemplate }) => {
  console.log(previewTemplate);
  return (
    <>
      {isModalOpen && (
        <Modal
          className="p-6 pt-0  pb-0 max-w-2xl"
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setPreviewTemplate(null)
          }}
        >
          {' '}
          <div className="h-6 bg-white py-5 mb-12 z-50">
            <p className='font-bold text-black mb-1'>Title: <span className='font-semibold text-gray-700'>{previewTemplate?.title}</span></p>
            <p className='font-bold text-black'>Subject: <span className='font-semibold text-gray-700'>{previewTemplate?.subject}</span></p>
          </div>
          <div
            style={{
              boxShadow:
                'rgba(50, 50, 93, 0.25) 0px 5px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset',
            }}
            className="p-6 rounded-lg z-40"
          >
            <div dangerouslySetInnerHTML={{ __html: previewTemplate?.body }} />
          </div>
          {/* Add a button to close the modal */}
          <div className="flex py-4 justify-end sticky bottom-0 bg-white gap-3 mx-auto">
            <Button className="w-40" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default PreviewTemplateModal