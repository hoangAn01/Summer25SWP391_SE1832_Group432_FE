import React from "react";
import "antd/dist/reset.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./redux/store";
import Header from "./components/header/Header";

import LoginForm from "./components/login/LoginForm";
import RegisterForm from "./components/register/RegisterForm";
import HomePage from "./pages/home-pages/HomePage";
import Blog1Detail from "./pages/home-pages/Blog1Detail";
import Blog2Detail from "./pages/home-pages/Blog2Detail";
import Blog3Detail from "./pages/home-pages/Blog3Detail";
import BlogDetail from "./pages/home-pages/Detail1";
import Detail2 from "./pages/home-pages/Detail2";
import Detail3 from "./pages/home-pages/Detail3";

import HealthProfilePage from "./pages/health_profile_pages/HealthProfilePage";
import Nurse from "./nurse";
import MedicalEvent from "./nurse/medical-event";
import Dashboard from "./components/dashboard/dashboard";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Header />
          <HomePage />
        </>
      ),
    },
    {
      path: "/login",
      element: <LoginForm />,
    },
    {
      path: "/register",
      element: <RegisterForm />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/nurse",
      element: <Nurse />,
      children: [
        {
          path: "/nurse/medical-event",
          element: <MedicalEvent />,
        },
      ],
    },
    {
      path: "/blog/hoat-dong-ngoai-khoa",
      element: (
        <>
          <Header />
          <Blog1Detail />
        </>
      ),
    },
    {
      path: "/blog/ky-nang-song",
      element: (
        <>
          <Header />
          <Blog2Detail />
        </>
      ),
    },
    {
      path: "/blog/cong-nghe-giao-duc",
      element: (
        <>
          <Header />
          <Blog3Detail />
        </>
      ),
    },
    {
      path: "/blog/phong-ngua-benh",
      element: (
        <>
          <Header />
          <BlogDetail />
        </>
      ),
    },
    {
      path: "/blog/dinh-duong-hoc-duong",
      element: (
        <>
          <Header />
          <Detail2 />
        </>
      ),
    },
    {
      path: "/blog/suc-khoe-tam-than",
      element: (
        <>
          <Header />
          <Detail3 />
        </>
      ),
    },
    {
      path: "/health-profile",
      element: <HealthProfilePage />,
    },
  ]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  );
}

export default App;
