import { Outlet, useLocation } from "react-router";
import { Navigation } from "../components/Navigation";

export function Root() {
  const location = useLocation();
  const hideNavOnRoutes = ["/upload-processing", "/knowledge-graph"];
  const showNav = !hideNavOnRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {showNav && <Navigation />}
      <Outlet />
    </div>
  );
}
