import React from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import {
  HomeLayout,
  HomePage,
  ProductPage,
  ShopCategoryPage,
  Login,
  ForgotPassword,
  ResetPassword,
  Register,
  CheckOutPage,
  ErrorPage,
  ProfilePage,
  AdminLayout,
  AddProduct,
  EditProduct,
  AllProduct,
  UserSettings,
  ForumPage,
  PostPage,
  InvoicePage,
  SalesReport,
  AllUsers,
  EditUser,
} from './Pages'
import { Marvel } from './Components/Banners/Marvel/Marvel'
import { DC } from './Components/Banners/DC/DC'
import { Misc } from './Components/Banners/Misc/Misc'
import { Animanga } from './Components/Banners/Animanga/Animanga'

import { action as registerAction } from './Components/RegisterComponents/RegisterComponent'
import { action as loginAction } from './Components/LoginComponent/LoginComponent'
import { action as forgotPasswordAction } from './Components/ForgotPasswordComponent/ForgotPasswordComponent'
import { action as resetPasswordAction } from './Components/ResetPasswordComponent/ResetPasswordComponent'
import { loader as Profileloader } from './Components/ProfilePageComponent/ProfilePageComponent'
import { action as addproductAction } from './Components/AddProductComponent/AddProductComponent'
import { loader as adminLoader } from './Components/SideBar/SideBar'
import { loader as allproductLoader } from './Components/AllProductComponent/AllProductComponent'
import { loader as allusersLoader } from './Components/AllUsersComponent/AllUsersComponent'
import { action as PostAction } from './Components/ForumComponents/PostComponent/PostComponent'
import { action as CommentAction } from './Components/GetPostComponents/GetPostComponent'

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "register",
        element: <Register />,
        action: registerAction
      },
      {
        path: "login",
        element: <Login />,
        action: loginAction
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
        action: forgotPasswordAction
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
        action: resetPasswordAction
      },
      {
        path: "profile",
        element: <ProfilePage />,
        loader: Profileloader,
        children: [
          {
            path: "settings",
            element: <UserSettings />
          },
        ]
      },
      {
        path: "product/:productId",
        element: <ProductPage />
      },
      {
        path: "checkout",
        element: <CheckOutPage />
      },
      // ── NUEVA RUTA: Factura ──────────────────────────────────────
      {
        path: "invoice/:orderId",
        element: <InvoicePage />
      },
      {
        path: "category/marvel",
        element: <ShopCategoryPage category="marvel" banner={<Marvel />} />,
      },
      {
        path: "category/dc",
        element: <ShopCategoryPage category="dc" banner={<DC />} />,
      },
      {
        path: "category/miscellaneous",
        element: <ShopCategoryPage category="miscellaneous" banner={<Misc />} />,
      },
      {
        path: "category/animanga",
        element: <ShopCategoryPage category="animanga" banner={<Animanga />} />,
      },
      {
        path: "forum",
        element: <ForumPage />,
        action: PostAction
      },
      {
        path: "post/:postId",
        element: <PostPage />,
        action: CommentAction
      },
      {
        path: "admin",
        element: <AdminLayout />,
        loader: adminLoader,
        children: [
          {
            path: "all-products",
            element: <AllProduct />,
            loader: allproductLoader,
          },
          {
            path: "edit-product/:productId",
            element: <EditProduct />,
          },
          {
            path: "add-product",
            element: <AddProduct />,
            action: addproductAction,
            loader: allproductLoader,
          },
          // ── NUEVA RUTA ADMIN: Reporte de ventas ───────────────────
          {
            path: "sales-report",
            element: <SalesReport />
          },
          // ── NUEVA RUTA ADMIN: Gestión de usuarios ───────────────────
          {
            path: "all-users",
            element: <AllUsers />,
            loader: allusersLoader,
          },
          {
            path: "edit-user/:userId",
            element: <EditUser />,
          }
        ]
      }
    ]
  },
])

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App
