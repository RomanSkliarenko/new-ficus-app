import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams, RouteChildrenProps } from 'react-router-dom';
import commentsOperations from '../../redux/comments/comments-operations';
import postsOperations from '../../redux/posts/post-operations';
import Loader from 'react-loader-spinner';
import PostsBackdrop from '../postsBackdrop/posts-backdrop';
import style from './selected-post.module.css';
import Comment from '../comment/comment';
import { toast } from 'react-toastify';
import IPost from '../../common/Post.interface';
import IComment from '../../common/Comment.interface';
import { useAppSelector } from '../../redux/store';
import IPostFields from '../../common/PostFields.interface';

const SelectedPost: React.FC<RouteChildrenProps> = () => {
  const history = useHistory();
  const [newCommentInputFlag, setNewCommentInputFlag] = useState(false);
  const [newCommentInput, setNewCommentInput] = useState('');
  const [newPostBackdrop, setNewPostBackdrop] = useState(false);
  const [currentPost, setCurrentPost] = useState<IPost | null>(null);
  const [currentPostComments, setCurrentPostComments] = useState<
    IComment[] | null | undefined
  >(null);

  const _id = useAppSelector(state => state.currentUser.user?._id);
  const { id } = useParams<{ id: string }>();

  const getCurrentPost = () => {
    postsOperations.getSelectedPost(id).then(data => {
      if (data) {
        setCurrentPost(data);
      }
    });
  };
  const getCurrentPostComments = () => {
    commentsOperations
      .getPostComments(id)
      .then(res => setCurrentPostComments(res));
  };
  const editPost = (values: IPostFields, postId: string) => {
    postsOperations
      .editPost(values, postId)
      .then(() => getCurrentPost())
      .then(() => getCurrentPostComments());
    setNewPostBackdrop(!newPostBackdrop);
    toast(`Success`);
  };
  const addCommentHandler = () =>
    _id
      ? setNewCommentInputFlag(!newCommentInputFlag)
      : toast(`Login first, please!`);

  const setPostLike = () =>
    _id
      ? postsOperations.setPostLike(id).then(() => getCurrentPost())
      : toast(`Login first, please!`);

  const addComment = () => {
    commentsOperations.addComment(id, newCommentInput).then(() => {
      setNewCommentInput('');
      setNewCommentInputFlag(false);
      getCurrentPostComments();
    });
  };

  const newCommentInputHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewCommentInput(event.target.value);
    },
    [],
  );

  const newPostBackDrophandler = () => {
    setNewPostBackdrop(!newPostBackdrop);
  };

  useEffect(() => {
    getCurrentPostComments();
    getCurrentPost();
  }, []);

  return (
    <>
      {currentPost ? (
        <section className={style.sectionContainer}>
          <div className={style.sectionNavBtnContainer}>
            <button
              className={style.sectionNavBtn}
              type="button"
              onClick={() => {
                history.push('/posts');
              }}
            >
              BACK
            </button>
            <button
              className={style.sectionNavBtn}
              type="button"
              onClick={addCommentHandler}
            >
              ADD COMMENT
            </button>
            {_id && currentPost.postedBy === _id ? (
              <button
                className={style.sectionNavBtn}
                type="button"
                onClick={newPostBackDrophandler}
              >
                EDIT
              </button>
            ) : null}
          </div>

          <ul className={style.postList}>
            <li className={style.listItem}>
              <span className={style.postTitle}>{currentPost?.title}</span>
            </li>
            <li className={style.listItem}>
              <span className={style.itemTitle}>Likes:</span>{' '}
              {currentPost?.likes?.length}
              <button
                type="button"
                className={style.likeButton}
                onClick={() => setPostLike()}
              >
                💔
              </button>
            </li>
            <li className={style.listItem}>
              <span className={style.itemTitle}>Description:</span>{' '}
              {currentPost?.description}
            </li>
            <li className={style.listItem}>
              <span className={style.itemTitle}>Text:</span>{' '}
              {currentPost?.fullText}
            </li>
            <li className={style.listItem}>
              <span className={style.itemTitle}>Comments:</span>
              {newCommentInputFlag ? (
                <>
                  <input
                    className={style.newCommentInput}
                    type="text"
                    onChange={newCommentInputHandler}
                    value={newCommentInput}
                  />
                  <button
                    className={style.sectionNavBtn}
                    type="button"
                    onClick={addComment}
                  >
                    SEND
                  </button>
                </>
              ) : null}
              <ul>
                {currentPostComments?.map((comment: IComment) => (
                  <Comment
                    key={comment._id}
                    authUser={!!_id}
                    sigleComment={comment}
                    getCurrentPostComments={getCurrentPostComments}
                    userId={_id}
                  />
                ))}
              </ul>
            </li>
          </ul>
        </section>
      ) : (
        <Loader
          className="spinner"
          type="BallTriangle"
          color="#7f0000"
          height={80}
          width={80}
        />
      )}
      {newPostBackdrop ? (
        <PostsBackdrop
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          currentPost={currentPost!} // ???????????????
          editPost={editPost}
          newPostBackdrop={newPostBackdrop}
          setNewPostBackdrop={setNewPostBackdrop}
          editOrCreate
        />
      ) : null}
    </>
  );
};

export default SelectedPost;
