const REQUIRED_FIELDS = ['name', 'description', 'category'];

function validateFormPayload (payload = {}, options = {}) {
  const errors = [];
  const { partial = false } = options;

  if (!partial) {
    REQUIRED_FIELDS.forEach(field => {
      if (!payload[field] || typeof payload[field] !== 'string' || payload[field].trim() === '') {
        errors.push(`El campo ${field} es obligatorio.`);
      }
    });
  }

  if (payload.status && !['Borrador', 'Publicado', 'Archivado'].includes(payload.status)) {
    errors.push('El estado debe ser Borrador, Publicado o Archivado.');
  }

  if (payload.name && payload.name.length > 120) {
    errors.push('El nombre no puede exceder 120 caracteres.');
  }

  return {
    valid: errors.length === 0,
    message: errors.join(' ')
  };
}

module.exports = {
  validateFormPayload
};
