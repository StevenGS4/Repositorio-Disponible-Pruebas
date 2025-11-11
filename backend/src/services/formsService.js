const FormsRepository = require('../data/formsRepository');

class FormsService {
  constructor () {
    this.repository = FormsRepository.getInstance();
  }

  async getForms ({ category } = {}) {
    if (category) {
      return this.repository.findByCategory(category);
    }
    return this.repository.findAll();
  }

  async getFormById (id) {
    return this.repository.findById(id);
  }

  async createForm (payload) {
    return this.repository.create(payload);
  }

  async updateForm (id, payload) {
    return this.repository.update(id, payload);
  }

  async deleteForm (id) {
    return this.repository.delete(id);
  }

  async getCategories () {
    return this.repository.getCategories();
  }
}

module.exports = FormsService;
