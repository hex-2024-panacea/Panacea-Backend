import express from "express";
import UserController from "../controllers/UserController";
import AuthController from "../controllers/AuthController";
const router = express.Router();

router.post('/auth/sign-in', AuthController.signIn);
router.post('/auth/register', AuthController.register);
router.post('/auth/verify-email', AuthController.verifyEmail);

router.get('/users', UserController.index);
router.get('/users/:id', UserController.show);
router.post('/users', UserController.store);
router.put('/users/:id', UserController.update);
router.delete('/users/:id', UserController.destroy);

export default router;
