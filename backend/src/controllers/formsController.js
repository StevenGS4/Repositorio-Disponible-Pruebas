const FormsService = require('../services/formsService');
const { validateFormPayload } = require('../utils/validators');

class FormsController {
  constructor () {
    this.formsService = new FormsService();
  }

  async list (req, res, next) {
    try {
      const { category } = req.query;
      const forms = await this.formsService.getForms({ category });
      res.json(forms);
    } catch (error) {
      next(error);
    }
  }

  async categories (req, res, next) {
    try {
      const categories = await this.formsService.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getById (req, res, next) {
    try {
      const form = await this.formsService.getFormById(req.params.id);
      if (!form) {
        return res.status(404).json({ message: 'Formulario no encontrado' });
      }
      res.json(form);
    } catch (error) {
      next(error);
    }
  }

  async create (req, res, next) {
    try {
      const validation = validateFormPayload(req.body);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }
      const form = await this.formsService.createForm(req.body);
      res.status(201).json(form);
    } catch (error) {
      next(error);
    }
  }

  async update (req, res, next) {
    try {
      const validation = validateFormPayload(req.body, { partial: true });
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }
      const form = await this.formsService.updateForm(req.params.id, req.body);
      if (!form) {
        return res.status(404).json({ message: 'Formulario no encontrado' });
      }
      res.json(form);
    } catch (error) {
      next(error);
    }
  }

  async remove (req, res, next) {
    try {
      const deleted = await this.formsService.deleteForm(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Formulario no encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FormsController;
