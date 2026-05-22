import React, { useContext, useEffect, useState } from 'react'
import './GetPostComponent.css'
import customFetch from '../../Utils/customFetch';
import { useActionData, useParams } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { GiMagicAxe } from "react-icons/gi";
import { GiBrokenAxe } from "react-icons/gi";
import {Form} from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext';
import { toast } from 'react-toastify';

export const action = async ({request, params}) => {
    const formData = await request.formData();
    const content = formData.get('content')
    const { postId } = params;

    try{
        await customFetch.post(`/post/${postId}/addcomment`, { content })
        toast.success('Publicado correctamente');
        return { reload: true }
    }
    catch (error){
        toast.error(error?.response?.data?.msg)
        console.log(error)
        return error
    }
}

const GetPostComponent = () => {

    const {postId} = useParams()
    const [post, setPost] = useState([]);
    const [comment, setComment] = useState([])
    const [hasVoted, setHasVoted] = useState(false);
    const [hasDownVoted, setHasDownVoted] = useState(false)
    const actionData = useActionData();

    const { votePost, downvotePost } = useContext(ShopContext)

    const fetchPost = async () => {
        try {

            const {data} = await customFetch.get(`/post/${postId}`)
            setPost(data.post);
            setHasVoted(data.post.hasVoted)
            setHasDownVoted(data.post.hasDownVoted)

            
        } catch (error) {
            console.log(error)
            
        }
    }

    const fetchcomments = async () => {

        try {
            const { data } = await customFetch.get(`/post/${postId}/allcomment`);
            setComment(data.comments);
            console.log(data)
            
        } catch (error) {
            console.log(error)
            
        }

    }

    useEffect(() => {
        if(actionData?.reload){
            fetchcomments();
            fetchPost();
            setHasVoted(!hasVoted);
            setHasDownVoted(!hasDownVoted)
        }   

        
    },[]);


    useEffect(() => {

        fetchPost();
        setHasVoted(!hasVoted);
        setHasDownVoted(!hasDownVoted)
        fetchcomments()
        
    },[]);

  const handleVoteClick = () => {
    votePost(post._id)

    if(hasVoted) {
        setHasVoted(false);
    } else{
        setHasVoted(true)
        setHasDownVoted(false)
    }
  };

  const handledownVoteClick =() => {
    downvotePost(post._id)
    if(hasDownVoted) {
        setHasDownVoted(false);
    } else{
        setHasDownVoted(true)
        setHasVoted(false)
    }
  }
  
  return (
    <div className="getpost-background">
        <div className="getpost-main">
            <div className="getpost-user">
                <CgProfile size={45}/>
                <div className="getpost-user-icon">
                    <h4>{post.author}</h4>
                    <p>{post.postDate}</p>
                </div>
            </div>
            <div className="getpost-specs">
                <h2>{post.title}</h2>
                <div className="getpost-filters">
                    <div className="getpost-filters-items">
                        <p>{post.category}</p>
                    </div>
                    <div className="getpost-filters-items">
                        <p>{post.type}</p>
                    </div>
                </div>
            </div>
            <div className="getpost-content">
                <p>{post.content}</p>
            </div>
 
            <div className="getpost-feedback">
                <div className="getpost-feedback-votes" onClick={handleVoteClick}>
                    <GiMagicAxe 
                        size={35}
                        color={hasVoted ? 'rgb(157, 52, 255)' : 'black'}
                    />
                </div>
                <div className="getpost-feedback-votes" onClick={handledownVoteClick}>
                    <GiBrokenAxe 
                    size={40}
                    color={hasDownVoted ? 'rgb(157, 52, 255)' : 'black'}/>
                </div>
            </div>
        </div>
         <Form method='post' >
            <div className="getpost-addcomment">
                    <div className="getpost-addcomment-top">
                        <h3>Agrega un Comentario</h3>
                    </div>
                    <div className="getpost-addcomment-middle">
                        <textarea name='content' required/>
                    </div>
                    <div className="getpost-addcomment-botom">
                        <button type='submit'>Publicar Comentario</button>
                    </div>
            </div>
        </Form>
        <div className="getpost-comments">
            <div className="getpost-comments-top">
                <h4>Comentarios</h4>
            </div>
            {comment.map((postComment) => {
                return<div className="getpost-comment-container">
                <div className="getpost-comment-container-top">
                    <CgProfile size={30}/>
                    <h4>{postComment.user.username}</h4>
                    <p>15/11/2025 12:15 pm</p>
                </div>
                <div className="getpost-comment-container-middle">
                    <p>{postComment.content}</p>
                </div>
                <div className="getpost-comment-container-bottom">
{/*                 <div className="getpost-feedback-votes">
                    <GiMagicAxe size={25}/>
                    <h4>{postComment.votes}</h4>
                </div>
                <div className="getpost-feedback-votes">
                    <GiBrokenAxe size={30}/>
                    <h4>{postComment.downvotes}</h4>
                </div> */}
                </div>
            </div>
            })}

        </div>
    </div>
  )
}

export default GetPostComponent