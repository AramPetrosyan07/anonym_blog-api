import PostModel from '../models/Post.js';
import CommentModel from '../models/Comment.js';


export const createComment = async (req, res) => {
    try {
        const { postId, comment } = req.body
        if (!comment) {
            return res.json({ message: "комментарий не может быть пустой" })
        }
        const newComment = new CommentModel({ comment, user: req.userId });
        await newComment.save();

        try {
            await PostModel.findByIdAndUpdate(postId, {
                // req.userId
                $push: { comments: newComment._id, }
            })
        } catch (err) {
            console.log(err);
        }
        // res.json(newComment)
    } catch (err) {

    }
}