import express from 'express';
import FormController from "../controllers/forms/forms.controller";;

const formRoutes = express.Router();

formRoutes.get('/:id', FormController.getFormById);
formRoutes.post('/', FormController.createForm);
formRoutes.delete('/', FormController.deleteForm);

export default formRoutes;