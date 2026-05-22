import React, {useEffect} from 'react'
import { Link, Form, redirect, useNavigation } from 'react-router-dom'
import './PostComponent.css'
import { FaImages } from "react-icons/fa";
import customFetch from '../../../Utils/customFetch';
import { POST_CATEGORY, POST_TYPE } from '../../../../../Utils/Constants';
import { toast } from 'react-toastify'

export const action = async ({request}) => {
  const formData = await request.formData();
  console.log(formData)
  try{
    await customFetch.post('/post/addpost', formData)
    toast.success('Publicado correctamente');
    return { reload: true };
  }
  catch (error){
    toast.error(error?.response?.data?.msg)
    console.log(error)
    return error
  }
}


const PostComponent = () => {
  return (
    <div className="post-background">
        <Form method='post' className='post-form' encType='multipart/form-data'>
          <div className="post-headers">
            <input name='title' type="text" placeholder='Titulo de tu publicacion' />
            <div className="post-filters">
              <div className="post-category">
                <select name = 'category'  placeholder= 'Comic'> 
                {Object.values(POST_CATEGORY).map((itemValue) => {
                  return(
                    <option key={itemValue} value= {itemValue}>
                      {itemValue}
                    </option>
                  );
                })}
                </select>
              </div>
              <div className="post-type">
                <select name='type'  placeholder= 'Discusion'>
                {Object.values(POST_TYPE).map((itemValue) => {
                  return(
                    <option key={itemValue} value= {itemValue}>
                      {itemValue}
                    </option>
                  );
                })}                
                </select>
              </div>
            </div>
          </div>
          <div className="post-text">
              <textarea name="content" type='text' placeholder='Escribe algo...'></textarea>
              <button type='submit'>Publicar</button>
              <div className="post-image">
                <FaImages color='white' size={35}/>
            </div>
          </div>
        </Form>
    </div>
  )
}

export default PostComponent