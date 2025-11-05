import { useSearchParams } from 'react-router-dom';

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setQueryParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(key, value);  // Set the parameter
    } else {
      newParams.delete(key);      // Remove if no value
    }

    setSearchParams(newParams);  // Update the URL with merged params
  };

  return { setQueryParam };
};
