import { Routes, Route } from "react-router-dom";
import HomeLayout from "../Layout/HomeLayout";
import Page_StoresItemsItemInformation from "../Pages/Page_StoresItemsItemInformation";
import Page_Store from "../Pages/Page_Store";
import Page_StoreDetail from "../Pages/Page_StoreDetail";
import Page_ToDoList from "../Pages/Page_ToDoList";
import Page_UserInformation from "../Pages/Page_UserInformation";
import Page_UserAccount from "../Pages/Page_UserAccount";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        <Route path="/" element={<Page_StoresItemsItemInformation />} />
        <Route path="/vat-pham" element={<Page_StoresItemsItemInformation />} />
        <Route path="/cua-hang" element={<Page_Store />} />
        <Route path="/cua-hang/:id" element={<Page_StoreDetail />} />
        <Route path="/can-mua" element={<Page_ToDoList />} />
        <Route path="/thong-tin-ca-nhan" element={<Page_UserInformation />} />
        <Route path="/quan-ly-tai-khoan" element={<Page_UserAccount />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
