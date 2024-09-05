import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { SnackbarProvider } from "notistack";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./components/app.component";
import "./config";
import { AuthContextProvider } from "./context/auth.context";
import { CurrentPageContextProvider } from "./context/current-page.context";
import "./index.scss";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <BrowserRouter>
        <SnackbarProvider>
            <AuthContextProvider>
                <CurrentPageContextProvider>
                    <App />
                </CurrentPageContextProvider>
            </AuthContextProvider>
        </SnackbarProvider>
    </BrowserRouter>,
);
