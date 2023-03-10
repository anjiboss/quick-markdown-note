import "./App.css";
import "react-toastify/dist/ReactToastify.min.css";
import "tippy.js/dist/tippy.css";
import { useEffect, useState } from "react";
import { appWindow } from "@tauri-apps/api/window";
import { moveWindow, Position } from "tauri-plugin-positioner-api";
import MainApp from "./components/MainApp";
import { GlobalContext } from "./context/GlobalContext";
import ToolBar from "./components/ToolBar";
import { homeDir } from "@tauri-apps/api/path";

// ANCHOR hide app instead of close
async function hideAppInsteadOfClose(evt: KeyboardEvent) {
    const { key } = evt;
    if ((evt.metaKey && key === "q") || (evt.ctrlKey && key === "w")) {
        console.log("hide app instead of close");
        evt.preventDefault();
        appWindow.hide();
    }
}

function App() {
    const [fontSize, setFontSize] = useState(20);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLock, setIsLock] = useState(false);

    // SECTION App setups
    useEffect(() => {
        // ANCHOR Change apps font size with ctrl + [] keys
        function changeFontSize(evt: KeyboardEvent) {
            const { key } = evt;
            if (evt.ctrlKey || evt.metaKey) {
                if (key === "]") {
                    evt.preventDefault();
                    setFontSize((prev) => prev + 1);
                }
                if (key === "[") {
                    evt.preventDefault();
                    setFontSize((prev) => prev - 1);
                }
            }
        }

        // ANCHOR change to view mode when app is not focused
        const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
            if (!focused) {
                setIsEditMode(false);
            }
        });

        // ANCHOR move window to top right corner
        moveWindow(Position.TopRight);
        document.addEventListener("keydown", hideAppInsteadOfClose);
        document.addEventListener("keydown", changeFontSize);
        return () => {
            document.removeEventListener("keydown", changeFontSize);
            document.removeEventListener("keydown", hideAppInsteadOfClose);
            unlisten.then((f) => f());
        };
    }, []);
    // !SECTION

    // this event is separate from the upper one because
    // this event must be reset once isLock state is changed
    useEffect(() => {
        const setupLocalShortcut = (evt: KeyboardEvent) => {
            // ANCHOR toggle edit/view mode with esc key
            if (evt.key === "Escape" && !isLock) {
                setIsEditMode((prev) => !prev);
            }

            // ANCHOR toggle lock mode with ctrl + l
            if (evt.key === "l" && (evt.ctrlKey || evt.metaKey)) {
                setIsLock((prev) => !prev);
            }
        };

        document.addEventListener("keydown", setupLocalShortcut);
        return () => {
            document.removeEventListener("keydown", setupLocalShortcut);
        };
    }, [isLock]);

    return (
        <GlobalContext.Provider
            value={{
                fontSize,
                updateFontSize: setFontSize,
                isEditMode,
                isLock,
                setIsLock,
                setIsEditMode,
                homeDir: homeDir(),
            }}
        >
            <div className="container">
                <ToolBar />
                <MainApp />
            </div>
        </GlobalContext.Provider>
    );
}

export default App;
