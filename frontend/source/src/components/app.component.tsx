import React from "react";
import { Route, Routes } from "react-router-dom";

import { NotFound } from "./not-found.component";
import { RequireAuth } from "./require-auth.component";
import { Dashboard } from "./dashboard.component";
import { Login } from "./login.component";
import { Ingredients } from "./ingredients.component";
import { UserRole } from "../types";

const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<Dashboard />} />} />
            <Route path="/ingredients" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<Ingredients />} />} />
            {/* <Route path="/works" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<WorkList />} />} />
            <Route path="/works/:id" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<WorkEdit />} />} />
            <Route path="/exhibitions" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<ExhibitionList />} />} />
            <Route path="/exhibitions/:id" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<ExhibitionEdit />} />} />
            <Route path="/user-settings" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<UserSettings />} />} /> */}
            <Route path="/404" element={<RequireAuth component={<NotFound />} />} />
            <Route path="*" element={<RequireAuth component={<NotFound />} />} />
        </Routes>
    );
};

export default App;
