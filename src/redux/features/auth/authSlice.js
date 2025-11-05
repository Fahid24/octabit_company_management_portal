import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("MONKEY-MAN-USER")) || {},
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("MONKEY-MAN-USER", JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.user = {};
      localStorage.removeItem("MONKEY-MAN-USER")
    },
    updateUserPhoto: (state, action) => {
      if (state.user) {
        state.user.user.photoUrl = action.payload;
        localStorage.setItem("MONKEY-MAN-USER", JSON.stringify(state.user)); // <-- persist update
      }
    }
  },
});

export const { setUser, logoutUser, updateUserPhoto } = userSlice.actions;

export default userSlice.reducer;