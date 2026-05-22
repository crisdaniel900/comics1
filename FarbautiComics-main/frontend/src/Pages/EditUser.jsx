import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EditUserComponent from '../Components/EditUserComponent/EditUserComponent'
import { CircleLoader } from 'react-spinners'
import customFetch from '../Utils/customFetch'

const EditUser = () => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await customFetch.get(`/users/${userId}`)
        setUser(data.user)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [userId])

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><CircleLoader size={150} color="#000000" /></div>
  if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Usuario no encontrado</div>

  return <EditUserComponent user={user} />
}

export default EditUser
