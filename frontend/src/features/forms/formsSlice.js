import { createAsyncThunk, createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import {
  fetchForms,
  createForm as createFormRequest,
  updateForm as updateFormRequest,
  deleteForm as deleteFormRequest,
  fetchCategories
} from '../../services/formsApi.js';

const formsAdapter = createEntityAdapter({
  selectId: (form) => form.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const initialState = formsAdapter.getInitialState({
  status: 'idle',
  error: null,
  categories: [],
  activeCategory: 'Todas'
});

export const loadForms = createAsyncThunk('forms/loadForms', async (_, { getState }) => {
  const { forms } = getState();
  const categoryFilter = forms.activeCategory !== 'Todas' ? forms.activeCategory : undefined;
  const [formsResponse, categories] = await Promise.all([
    fetchForms(categoryFilter),
    fetchCategories()
  ]);
  return { forms: formsResponse, categories };
});

export const createForm = createAsyncThunk('forms/createForm', async (payload) => {
  return createFormRequest(payload);
});

export const updateForm = createAsyncThunk('forms/updateForm', async ({ id, changes }) => {
  return updateFormRequest(id, changes);
});

export const deleteForm = createAsyncThunk('forms/deleteForm', async (id) => {
  await deleteFormRequest(id);
  return id;
});

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadForms.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadForms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        formsAdapter.setAll(state, action.payload.forms);
        state.categories = ['Todas', ...action.payload.categories];
      })
      .addCase(loadForms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createForm.fulfilled, (state, action) => {
        formsAdapter.addOne(state, action.payload);
        if (!state.categories.includes(action.payload.category)) {
          state.categories.push(action.payload.category);
        }
      })
      .addCase(updateForm.fulfilled, (state, action) => {
        formsAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteForm.fulfilled, (state, action) => {
        formsAdapter.removeOne(state, action.payload);
      });
  }
});

export const { setActiveCategory } = formsSlice.actions;

export const formsSelectors = formsAdapter.getSelectors((state) => state.forms);

export default formsSlice.reducer;
