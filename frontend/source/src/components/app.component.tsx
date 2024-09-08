import React from "react";
import { Route, Routes } from "react-router-dom";

import { UserRole } from "../types";
import { Dashboard } from "./dashboard.component";
import { Ingredients } from "./ingredients.component";
import { Login } from "./login.component";
import { NotFound } from "./not-found.component";
import { RequireAuth } from "./require-auth.component";
import { Recipes } from "./recipes.component";

const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<Dashboard />} />} />
            <Route path="/ingredients" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<Ingredients />} />} />
            <Route path="/recipes" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<Recipes />} />} />
            {/* <Route path="/works/:id" element={<RequireAuth requiredRoles={[UserRole.USER]} component={<WorkEdit />} />} /> */}
            <Route path="/404" element={<RequireAuth component={<NotFound />} />} />
            <Route path="*" element={<RequireAuth component={<NotFound />} />} />
        </Routes>
    );
};

export default App;
