import { createSlice } from '@reduxjs/toolkit';


export const storeSlice = createSlice({
    name: 'store',
    initialState: {
        store: [],
    },
    reducers: {
        setStore: (state, action) => {
            state.store = action.payload;
        },
    },
});


export const { setStore } = storeSlice.actions;
export default storeSlice.reducer;
