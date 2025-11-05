import { apiSlice } from "../api/api";

export const uploadApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadFile: builder.mutation({
            query: (formData) => {
                // console.log(formData)
                let url = `api/upload`;

                return {
                    url,
                    method: "POST",
                    body: formData,
                    formData: true,  // Ensure correct content type
                };
            },
            invalidatesTags: ['Files'], // Invalidate Files tag after upload
        }),

        deleteFile: builder.mutation({
            query: (filename) => ({
                url: `api/upload?filename=${filename.split('/').pop()}`, // Encode filename for URL
                method: "DELETE",
            }),
            invalidatesTags: ['Files'], // Invalidate Files tag after delete
        }),

        getAllFiles: builder.query({
            query: () => ({
                url: 'api/upload',
                method: 'GET',
            }),
            providesTags: ['Files'],
        }),
    }),
});

export const { 
    useUploadFileMutation, 
    useDeleteFileMutation,
    useGetAllFilesQuery 
} = uploadApiSlice;
