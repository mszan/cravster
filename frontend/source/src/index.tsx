import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./components/app.component";
import "./config";
import { AuthContextProvider } from "./context/auth.context";
import { CurrentPageContextProvider } from "./context/current-page.context";
import "./index.scss";
import { ConfigProvider, notification } from "antd";

notification.config({
    duration: 4,
    placement: "bottomRight",
    showProgress: true,
    pauseOnHover: true,
    closable: true,
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <BrowserRouter>
        <ConfigProvider>
            <AuthContextProvider>
                <CurrentPageContextProvider>
                    <App />
                </CurrentPageContextProvider>
            </AuthContextProvider>
        </ConfigProvider>
    </BrowserRouter>,
);
