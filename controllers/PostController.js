import PostModel from '../models/Post.js';
import CommentModel from '../models/Comment.js';
import path from "path"
import fs from "fs"

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel
      .find()
      .sort({ "createdAt": -1 })
      .limit(15).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()

    const clearTags = [...new Set(tags)]
      .slice(0, 7);

    res.json(clearTags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить тэги',
    });
  }
};


export const getPostsByTas = async (req, res) => {
  const tag = req.params.name;

  const posts = await PostModel
    .find({ tags: { $in: tag } })
    .sort({ createdAt: -1 })
    .populate('user', 'fullName')
    .exec();
  res.json(posts)
}

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel
      .find()
      .sort({ createdAt: -1 })
      .populate('user', 'fullName').exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось вернуть статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    const currentDir = path.resolve();
    const remodeObj = await PostModel.findOne({ _id: postId })
    // console.log(remodeObj.comments);

    await CommentModel.deleteMany({ _id: { $in: remodeObj.comments } })

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        fs.unlink(path.join(currentDir, remodeObj.imageUrl))

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};
export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(","),
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags.split(','),
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id)
    const list = await Promise.all(
      post.comments.map((comment) => {
        const comentWithUser = CommentModel
          .findById(comment)
          .populate('user', 'fullName').exec();

        return comentWithUser;
      })
    )
    res.json(list.reverse())
  } catch (err) {
    console.log(err, "mi ban en chi");
  }
}
