import express from "express";
const router = express.Router();
import { signup } from "../controllers/users";

/* GET users listing. */
router.post('/auth/sign-up',signup);

export default router;
