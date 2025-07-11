import React from "react";
import "antd/dist/reset.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { persistor, store } from "./redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import HomePage from "./pages/home-pages/HomePage";

import Dashboard from "./dashboard/dashboard";

import Export_pdf from "./dashboard/dashboad_element/export_pdf";
import Manage_account from "./dashboard/dashboad_element/Manager_Account/Manage_account";
import Report from "./dashboard/dashboad_element/report";

import BlogDetail from "./pages/home-pages/Detail/Detail1";
import Detail3 from "./pages/home-pages/Detail/Detail3";
import Detail2 from "./pages/home-pages/Detail/Detail2";
import HealthProfileCreatePage from "./pages/home-pages/ParentForm/HealthProfileCreate";
import EventPage from "./pages/home-pages/ParentForm/Event";

import RegisterForm from "./components/register-form/RegisterForm";
import LoginForm from "./components/login-form/LoginForm";

import Header from "./components/Header/Header";
import ParentProfile from "./pages/home-pages/ParentForm/ParentProfile";
import MedicationForm from "./pages/home-pages/ParentForm/MedicationForm";

import Nurse from "./nurse";
import MedicalEvent from "./nurse/medical-event";
import Created_event from "./dashboard/dashboad_element/Created_event";
import StudentProfileList from "./nurse/StudentProfileList";
import StudentSearch from "./dashboard/dashboad_element/StudentSearch";
import NurseProfile from "./nurse/NurseProfile";
import MedicineReceiveForm from "./nurse/receive notification/MedicineReceiveForm";
import ApproveMedicine from "./nurse/approveMedicine";
import StudentHealthProfile from "./pages/home-pages/ParentForm/StudentHealthProfle";
import EventNow from "./dashboard/dashboad_element/Event_now";
import HealthProfileEdit from "./pages/home-pages/ParentForm/HealthProfileEdit";
import MedicalInventory from "./nurse/medical-inventory";
import BlogCreateForm from "./components/Blog/BlogCreateForm";
import EventCreate from "./dashboard/dashboad_element/Create_event/EventCreate";
import ConfirmEvent from "./pages/home-pages/ParentForm/ConfirmEvent";
import VaccineEventReport from "./nurse/VaccineEventReport";
import CheckUp from "./nurse/CheckUp";

import ManagerBlog from "./dashboard/dashboad_element/Manager_blog";
import BlogDetailDynamic from "./pages/home-pages/blog/BlogDetailDynamic";

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
      element: <LoginForm />,
    },
    {
      path: "/register",
      element: <RegisterForm />,
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
      path: "/blog/:blogPostId",
      element: <BlogDetailDynamic />,
    },

    {
      path: "/create-health-profile",
      element: <HealthProfileCreatePage />,
    },
    {
      path: "/medication_form",
      element: <MedicationForm />,
    },
    {
      path: "/nurse",
      element: <Nurse />,
      children: [
        {
          path: "/nurse/medical-event",
          element: <MedicalEvent />,
        },
        {
          path: "/nurse/student-profile-list",
          element: <StudentProfileList />,
        },
        {
          path: "/nurse/profile",
          element: <NurseProfile />,
        },
        {
          path: "/nurse/approve-medicine",
          element: <ApproveMedicine />,
        },
        {
          path: "/nurse/medicine-receive",
          element: <MedicineReceiveForm />,
        },
        {
          path: "/nurse/medical-inventory",
          element: <MedicalInventory />,
        },
        {
          path: "/nurse/checkup",
          element: <CheckUp />,
        },
        {
          path: "/nurse/vaccine-event-report",
          element: <VaccineEventReport />,
        },
        {
          path: "/nurse/blog",
          element: <BlogCreateForm />,
        },
      ],
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
      children: [
        {
          path: "create_event",
          element: <EventCreate />,
        },
        {
          path: "manage_account",
          element: <Manage_account />,
        },
        {
          path: "export_pdf",
          element: <Export_pdf />,
        },
        {
          path: "report",
          element: <Report />,
        },
        {
          path: "created_event",
          element: <Created_event />,
        },
        {
          path: "event_now",
          element: <EventNow />,
        },
        {
          path: "student_profile",
          element: <StudentSearch />,
        },
        {
          path: "manager_blog",
          element: <ManagerBlog />,
        },
        // {
        //   path: "manageBlog",
        //   element: <ManagerBlog />,
        // },
        // {
        //   path: "approve_blog",
        //   element: <ApproveBlog />,
        // },
      ],
    },
    {
      path: "/event",
      element: (
        <>
          <Header />
          <EventPage />
        </>
      ),
    },
    {
      path: "/parent-profile",
      element: (
        <>
          <Header />
          <ParentProfile />
        </>
      ),
    },
    {
      path: "/student-health-profile/:studentId",
      element: <StudentHealthProfile />,
    },
    {
      path: "/student-health-profile/edit",
      element: <HealthProfileEdit />,
    },
    {
      path: "/confirm-event",
      element: (
        <>
          <Header />
          <ConfirmEvent />
        </>
      ),
    },
  ]);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router}></RouterProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
