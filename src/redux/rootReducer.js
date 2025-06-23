import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import parentReducer from "./features/parentSlice";
const rootReducer = combineReducers({
  user: userReducer,
  parent: parentReducer,
});
export default rootReducer;
