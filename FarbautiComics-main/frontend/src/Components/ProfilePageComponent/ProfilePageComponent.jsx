import React,{useContext, useEffect, useState} from 'react'
import { Link, redirect, useLoaderData, useNavigate } from 'react-router-dom'
import customFetch from '../../Utils/customFetch';
import './ProfilePageComponent.css'
import ProfileListComponent from '../ProfileListComponent/ProfileListComponent';
import RecentOrdersComponent from '../RecentOrdersComponent/RecentOrdersComponent';

// loader, carga los datos que se encuentran en el endpoint profile
// los cuales contienen los atributos del usuario

export const loader = async () => {
    try {
      const { data } = await customFetch.get('/users/profile');
      return data;
    }catch (error) {
      return redirect('/');
    }
  }


const ProfilePageComponent = () => {

    const { user } = useLoaderData();

  return (

    <div className="profile">
      <div className="profile-top">
        <div className="profile-top-left">
          <h2>{user.name} {user.lastName}</h2>
          <p>{user.username}</p>
          <p>{user.address}</p>
        </div>
        <div className="profile-top-right">
          <div className="profile-top-right-numbers">
            <h2>{user.readHistory.length}</h2>
            <p>Biblioteca</p>
          </div>
          <div className="profile-top-right-numbers">
            <h2>{user.favorites.length}</h2>
            <p>Favoritos</p>
          </div>
          <div className="profile-top-right-numbers">
            <h2>{user.wishlist.length}</h2>
            <p>Lista de deseos</p>
          </div>
        </div>
      </div>
      <ProfileListComponent 
      favorites = {user.favorites} 
      readHistory = {user.readHistory} 
      wishlist = {user.wishlist}/>
      <RecentOrdersComponent />
    </div>


  )
}

export default ProfilePageComponent