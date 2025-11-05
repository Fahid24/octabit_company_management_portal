import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import PropTypes from 'prop-types';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = forwardRef(({ value, onChange, className }, ref) => {
  const sigCanvas = useRef(null);

  useImperativeHandle(ref, () => ({
    clear: () => sigCanvas.current?.clear(),
    isEmpty: () => sigCanvas.current?.isEmpty(),
    toDataURL: () => sigCanvas.current?.toDataURL(),
  }));

  useEffect(() => {
    if (value && sigCanvas.current) {
      sigCanvas.current.fromDataURL(value);
    }
  }, [value]);

  const handleEnd = () => {
    if (onChange) {
      onChange(sigCanvas.current?.isEmpty() ? '' : sigCanvas.current?.toDataURL());
    }
  };

  return (
    <div className={`border rounded bg-white p-2 ${className}`}>
      <SignatureCanvas
        ref={sigCanvas}
        penColor='black'
        canvasProps={{
          width: 400,
          height: 120,
          className: 'w-full border rounded bg-white',
        }}
        onEnd={handleEnd}
      />
      <button
        type="button"
        className="mt-2 px-3 py-1 bg-gray-200 rounded text-sm"
        onClick={() => {
          sigCanvas.current?.clear();
          if (onChange) {
            onChange('');
          }
        }}
      >
        Clear
      </button>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

SignaturePad.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default SignaturePad; 