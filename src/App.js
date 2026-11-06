import "./App.css";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <Header />
      <Main />
      <Footer />
    </>
  );
}

export default App;
