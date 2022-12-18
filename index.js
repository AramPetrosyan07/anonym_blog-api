import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';
import * as dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose';

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController, CommentController } from './controllers/index.js';

mongoose.set('strictQuery', false);
mongoose
  .connect(`mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASS}@cluster0.zudjfui.mongodb.net/blog?retryWrites=true&w=majority`)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/tags/:name', PostController.getPostsByTas);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.post("/comment/:id", checkAuth, CommentController.createComment)
app.get("/getcomment/:id", PostController.getPostComments)

const PORT = process.env.PORT || 4444

app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`Server running on port ${PORT}...`);
});