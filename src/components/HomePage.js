import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import CallToAction from "./CallToAction";
import BookingPage from "./BookingPage";
import Specials from "./Specials";
import CustomersSay from "./CustomersSay";
import Chicago from "./Chicago";
import { getScrollBehavior } from "../utils/scrollBehavior";

function HomePage({ submitForm }) {
  const { hash } = useLocation();

  // In-page links (/#about, /#specials) scroll to their section. Resetting to the
  // top for plain navigations is handled once, for every route, in Main.js.
  useEffect(() => {
    if (!hash) return undefined;

    const target = document.getElementById(hash.slice(1));
    if (!target) return undefined;

    const frame = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  return (
    <>
      <CallToAction />
      <BookingPage submitForm={submitForm} />
      <Specials />
      <CustomersSay />
      <Chicago />
    </>
  );
}

export default HomePage;
