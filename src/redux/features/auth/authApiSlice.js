import { apiSlice } from "../api/api";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    onboardEmployee: builder.mutation({
      query: (employeeData) => ({
        url: "api/employee/onboarding",
        method: "POST",
        body: employeeData,
      }),
    }),
    login: builder.mutation({
      query: (data) => {
        return {
          url: "api/auth/login",
          method: "POST",
          body: data,
        };
      },
    }),
    changePassword: builder.mutation({
      query: (data) => {
        return {
          url: "api/auth/changepassword",
          method: "PATCH",
          body: data,
        };
      },
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "api/auth/forgotpassword",
        method: "PATCH",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "api/auth/resetpassword",
        method: "PATCH",
        body: data, // expects { token, newPassword }
      }),
    }),
    sendOtp: builder.mutation({
      query: (data) => ({
        url: "api/auth/send-otp",
        method: "POST",
        body: data, // expects { token, newPassword }
      }),
    }),
    verifyEmailOtp: builder.mutation({
      query: (data) => ({
        url: "api/auth/verify-email-otp",
        method: "POST",
        body: data, // expects { token, newPassword }
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useOnboardEmployeeMutation,
  useSendOtpMutation,
  useVerifyEmailOtpMutation,
} = authApiSlice;
