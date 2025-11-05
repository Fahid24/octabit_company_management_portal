import { Outlet, useLocation } from "react-router-dom";
import { ResponsiveNavigation } from "@/component/sidebar/ResponsiveNavigation";
import TopRightProfile from "@/component/sidebar/TopRightProfile";
import LazyImage from "@/utils/LazyImage";
import logo from "/odl.gif";
import { useEffect, useState } from "react";
import ColorfulRoundsBg from "./Backgrounds/SmoothCircles";
import { companyName } from "@/constant/companyInfo";

const Main = () => {
  const excludedPaths = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/register",
    "/lms",
    "/complete-profile",
    "/update-profile",
  ];

  const dynamicPaths = [
    /^\/register\/.*$/,
    /^\/access-register\/.*$/,
    /^\/signup\/.*$/,
    /^\/plans\/.*$/,
    /^\/mobile-update-profile(\?.*)?$/,
    /^\/mobile-login(\?.*)?$/,
  ];

  const location = useLocation();
  const { pathname } = location;

  const hide =
    excludedPaths.includes(pathname) ||
    dynamicPaths.some((pattern) => pattern.test(pathname));

  const [marginLeft, setMarginLeft] = useState(
    window.innerWidth >= 1024 ? "175px" : "0"
  );

  const isSmallDevice = window.innerWidth < 780;
  const bg = isSmallDevice ? "bg-white" : "";

  useEffect(() => {
    const skipScrollPaths = ["/create-project"];
    const dynamicUpdateProjectPattern = /^\/update-project\/[a-zA-Z0-9]+$/;

    const shouldSkipScroll =
      skipScrollPaths.includes(pathname) ||
      dynamicUpdateProjectPattern.test(pathname);

    if (!shouldSkipScroll) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth >= 1024 ? "175px" : "0");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen">
      {/* <ColorfulRoundsBg/> */}
      {!hide && <ResponsiveNavigation />}
      {/* Top right profile and logout */}
      {(!hide && isSmallDevice) && (
        <div
          className={` w-full fixed top-0 left-0 z-50 ${bg}`}
        >
          {/* MOBILE BACKGROUND ONLY */}
          <div className="absolute inset-0 sm:hidden " />

          {/* Logo (only on mobile) */}
          <div className="flex justify-between gap-x-1 items-center p-2">
            <div className="">
              <LazyImage src={logo} alt="Logo" imgClass={"h-auto  w-12"} />
            </div>
            <div className="text-xl lg:text-2xl font-bold w-full font-gilroy mt-1">
              {companyName}
            </div>
          </div>

          {/* Profile (always on top right) */}
          <div className="fixed top-0 right-0 z-40">
            <TopRightProfile />
          </div>
        </div>
      )}

      { (!hide && !isSmallDevice) && (
        <div className="">
          <div className="md:hidden flex justify-between gap-x-1 items-center p-2">
            <div className="">
              <LazyImage src={logo} alt="Logo" imgClass={"h-12  w-12"} />
            </div>
            <div className="text-2xl font-bold w-full font-gilroy mt-1">
              {companyName}
            </div>
          </div>
        <div className="fixed top-0 right-0 z-40">
        <TopRightProfile />
      </div>
        </div>
        
      )}
      
      <main
        style={{
          marginTop: hide ? "0" : "60px",
          marginLeft: hide ? "0" : marginLeft,
        }}
      >
        {/* Main content area */}
        <Outlet />
      </main>
    </div>
  );
};

export default Main;
