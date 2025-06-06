import React from "react";
import "antd/dist/reset.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./login-page/LoginPage";
import RegisterPage from "./register-page/RegisterPage";
import HomePage from "./home-pages/HomePage";
import Blog1Detail from "./home-pages/Blog1Detail";
import Blog2Detail from "./home-pages/Blog2Detail";
import Blog3Detail from "./home-pages/Blog3Detail";
import BlogDetail from "./home-pages/Detail1";
import Detail2 from "./home-pages/Detail2";
import Detail3 from "./home-pages/Detail3";
import Header from "./components/Header";
import { persistor, store } from "./redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ScrollToTop from "./components/ScrollToTop";

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
      path: "/home",
      element: (
        <>
          <Header />
          <HomePage />
        </>
      ),
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
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
  ]);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router}>
          <ScrollToTop />
        </RouterProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
