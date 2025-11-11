import PropTypes from 'prop-types';

const STATUS_MAP = {
  Publicado: 'status-pill published',
  Borrador: 'status-pill draft',
  Archivado: 'status-pill archived'
};

export function FormsTable ({ forms, onEdit, onDelete }) {
  if (!forms.length) {
    return <p>No hay formularios en esta categoría.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Versión</th>
            <th>Actualizado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <tr key={form.id}>
              <td>{form.name}</td>
              <td>{form.category}</td>
              <td>
                <span className={STATUS_MAP[form.status] || STATUS_MAP.Borrador}>
                  {form.status}
                </span>
              </td>
              <td>{form.version}</td>
              <td>{new Date(form.updatedAt).toLocaleString()}</td>
              <td className="actions">
                <button type="button" className="action edit" onClick={() => onEdit(form)}>
                  Editar
                </button>
                <button type="button" className="action delete" onClick={() => onDelete(form.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

FormsTable.propTypes = {
  forms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      version: PropTypes.number.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
