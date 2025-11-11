import { configureStore } from '@reduxjs/toolkit';
import formsReducer from '../features/forms/formsSlice.js';

export const store = configureStore({
  reducer: {
    forms: formsReducer
  }
});
