import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createForm,
  deleteForm,
  formsSelectors,
  loadForms,
  setActiveCategory,
  updateForm
} from './features/forms/formsSlice.js';
import { Tabs } from './components/Tabs.jsx';
import { FormsTable } from './components/FormsTable.jsx';
import { FormEditor } from './components/FormEditor.jsx';

function App () {
  const dispatch = useDispatch();
  const forms = useSelector(formsSelectors.selectAll);
  const status = useSelector((state) => state.forms.status);
  const categories = useSelector((state) => state.forms.categories);
  const activeCategory = useSelector((state) => state.forms.activeCategory);
  const error = useSelector((state) => state.forms.error);

  const [editingForm, setEditingForm] = useState(null);

  useEffect(() => {
    dispatch(loadForms());
  }, [dispatch]);

  const filteredForms = useMemo(() => {
    if (activeCategory === 'Todas') {
      return forms;
    }
    return forms.filter((form) => form.category === activeCategory);
  }, [forms, activeCategory]);

  const handleCreateOrUpdate = async (formData) => {
    if (editingForm) {
      await dispatch(updateForm({ id: editingForm.id, changes: formData }));
      setEditingForm(null);
    } else {
      await dispatch(createForm(formData));
    }
    dispatch(loadForms());
  };

  const handleDelete = async (id) => {
    await dispatch(deleteForm(id));
    dispatch(loadForms());
  };

  return (
    <div className="app-shell">
      <header>
        <h1>Gestión de Formularios SAP CDS</h1>
        <p>Administra formularios desde el FrontEnd PWA y sincroniza los cambios con el BackEnd.</p>
      </header>
      <main>
        <Tabs
          categories={categories.length ? categories : ['Todas']}
          activeCategory={activeCategory}
          onSelect={(category) => {
            dispatch(setActiveCategory(category));
            dispatch(loadForms());
          }}
        />

        {status === 'loading' && <p>Cargando formularios...</p>}
        {error && <p role="alert">Ocurrió un error: {error}</p>}

        <FormsTable
          forms={filteredForms}
          onEdit={(form) => setEditingForm(form)}
          onDelete={handleDelete}
        />

        <section>
          <h2>{editingForm ? 'Editar formulario' : 'Crear nuevo formulario'}</h2>
          <FormEditor
            categories={categories.length ? categories : ['Todas']}
            onSubmit={handleCreateOrUpdate}
            editingForm={editingForm}
            onCancel={() => setEditingForm(null)}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
