import express from 'express';
import * as myModelController from '../controllers/myModelController';
import { authorize } from '../middlewares/authorizationMiddleware';
import { IdentityType } from '../enums/identityType';

const router = express.Router();

router.get('/', authorize([IdentityType.USER]), myModelController.getAllMyModels);
router.get('/:id', myModelController.getMyModel);
router.post('/', myModelController.createMyModel);
router.put('/:id', myModelController.updateMyModel);
router.delete('/:id', myModelController.deleteMyModel);

export default router;
