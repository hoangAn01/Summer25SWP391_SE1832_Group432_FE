import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import rootReducer from "./rootReducer";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { fetchParentByUserId } from "./features/parentSlice";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

// Tự động fetch parent khi user đăng nhập
let currentUserId = null;
store.subscribe(() => {
  const state = store.getState();
  const user = state.user;
  if (user && user.userID !== currentUserId) {
    currentUserId = user.userID;
    store.dispatch(fetchParentByUserId(user.userID));
  }
});
