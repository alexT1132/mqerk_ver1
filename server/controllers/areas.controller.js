import * as Areas from '../models/areas.model.js';

export const listAreas = async (req, res) => {
  try {
    const rows = await Areas.listAreas({ activos: req.query.inactivos ? false : true });
    res.json({ data: rows });
  } catch (e) {
    console.error('listAreas', e); res.status(500).json({ message: 'Error interno' });
  }
};

export const catalogAreas = async (req, res) => {
  try {
    const catalog = await Areas.getCatalogStructured();
    res.json({ data: catalog });
  } catch (e) {
    console.error('catalogAreas', e); res.status(500).json({ message: 'Error interno' });
  }
};

export const getArea = async (req, res) => {
  try {
    const area = await Areas.getAreaById(req.params.id);
    if(!area) return res.status(404).json({ message: 'No encontrada' });
    res.json({ data: area });
  } catch (e) {
    console.error('getArea', e); res.status(500).json({ message: 'Error interno' });
  }
};
