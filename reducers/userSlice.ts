import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
    },
    reducers: {
        login: (state, action) => {
            // Assign the payload to state.user
            state.user = action.payload;
        },
        logout: (state) => {
            // Reset the user to null on logout
            state.user = null;
        },
        updateUser: (state, action) => {
            // Update specific fields in the user object without overwriting the whole state
            if (state.user ) {
                state.user = {
                    ...state.user,
                    ...action.payload,  // Merge the existing user state with the updated fields
                };
            }
        },
    },
});

export const { login, logout, updateUser } = userSlice.actions;

export default userSlice.reducer;
