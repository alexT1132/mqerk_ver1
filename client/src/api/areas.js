import api from './axios';

export const getAreasCatalog = () => api.get('/areas/catalog');
export const getArea = (id) => api.get(`/areas/${id}`);
export const listAreas = () => api.get('/areas');

export default { getAreasCatalog, getArea, listAreas };
