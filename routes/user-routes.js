import { Router } from "express";
import { registerUser, userLogin, getCurrentUser, updateUserProfile, deleteUserAccount } from "../controllers/users.js";


const usersRouter = Router();

usersRouter.post('/users/register', registerUser);
usersRouter.post('/users/login', userLogin);
usersRouter.get('/users/me', getCurrentUser);
usersRouter.put('/users/me', updateUserProfile);
usersRouter.delete('/users/me', deleteUserAccount);

export default usersRouter;