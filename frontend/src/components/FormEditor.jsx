import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  status: 'Borrador'
};

const STATUS_OPTIONS = ['Borrador', 'Publicado', 'Archivado'];

export function FormEditor ({ categories, onSubmit, editingForm, onCancel }) {
  const [formState, setFormState] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingForm) {
      setFormState({
        name: editingForm.name,
        description: editingForm.description,
        category: editingForm.category,
        status: editingForm.status
      });
    } else {
      setFormState(EMPTY_FORM);
    }
  }, [editingForm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formState);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nombre del formulario
        <input
          required
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Ingresa un nombre descriptivo"
        />
      </label>

      <label>
        Descripción
        <textarea
          required
          name="description"
          value={formState.description}
          onChange={handleChange}
          placeholder="Describe el objetivo del formulario"
          rows={4}
        />
      </label>

      <label>
        Categoría
        <select name="category" required value={formState.category} onChange={handleChange}>
          <option value="" disabled>Selecciona una categoría</option>
          {(categories.filter((category) => category !== 'Todas').length
            ? categories.filter((category) => category !== 'Todas')
            : ['Operaciones', 'Ventas', 'Recursos Humanos']
          ).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label>
        Estado
        <select name="status" value={formState.status} onChange={handleChange}>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <div className="actions">
        <button type="submit" className="primary">
          {editingForm ? 'Actualizar formulario' : 'Crear formulario'}
        </button>
        {editingForm ? (
          <button type="button" className="action" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

FormEditor.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  editingForm: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    status: PropTypes.string
  })
};
