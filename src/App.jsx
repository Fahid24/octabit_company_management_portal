// App.jsx
import { Provider } from "react-redux";
import store from "./redux/store";
import { POSITIONS, ToastContainer } from "./component/Toast";
import AppRouter from "./router/Routes";
import InstallPrompt from "./utils/InstallPrompt";

function App() {
  return (
    <Provider store={store}>
      <>
        <AppRouter />
        <ToastContainer position={POSITIONS.TOP_RIGHT} />
        {/* <InstallPrompt /> */}
      </>
    </Provider>
  );
}

export default App;
