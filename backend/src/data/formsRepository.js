const { v4: uuid } = require('uuid');

class FormsRepository {
  constructor () {
    this.forms = new Map();
    this.categories = new Set(['Operaciones', 'Ventas', 'Recursos Humanos']);
    this.seed();
  }

  static getInstance () {
    if (!FormsRepository.instance) {
      FormsRepository.instance = new FormsRepository();
    }
    return FormsRepository.instance;
  }

  seed () {
    const seedData = [
      {
        name: 'Solicitud de vacaciones',
        description: 'Formulario para gestionar vacaciones del personal.',
        category: 'Recursos Humanos',
        status: 'Publicado'
      },
      {
        name: 'Alta de nuevo cliente',
        description: 'Captura los datos comerciales de un nuevo cliente.',
        category: 'Ventas',
        status: 'Borrador'
      },
      {
        name: 'Reporte de incidente',
        description: 'Documenta incidentes operativos y acciones correctivas.',
        category: 'Operaciones',
        status: 'Publicado'
      }
    ];

    seedData.forEach(form => this.create(form));
  }

  findAll () {
    return Array.from(this.forms.values());
  }

  findById (id) {
    return this.forms.get(id) || null;
  }

  findByCategory (category) {
    return this.findAll().filter(form => form.category === category);
  }

  create (payload) {
    const id = uuid();
    const createdAt = new Date().toISOString();
    const form = {
      id,
      name: payload.name,
      description: payload.description,
      category: payload.category,
      status: payload.status || 'Borrador',
      version: payload.version || 1,
      createdAt,
      updatedAt: createdAt
    };
    this.forms.set(id, form);
    this.categories.add(form.category);
    return form;
  }

  update (id, payload) {
    const current = this.forms.get(id);
    if (!current) {
      return null;
    }
    const updated = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
      version: (current.version || 1) + 1
    };
    this.forms.set(id, updated);
    if (updated.category) {
      this.categories.add(updated.category);
    }
    return updated;
  }

  delete (id) {
    return this.forms.delete(id);
  }

  getCategories () {
    return Array.from(this.categories.values());
  }
}

module.exports = FormsRepository;
