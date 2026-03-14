import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminPage } from "./pages/AdminPage";
import { CommunityPage } from "./pages/CommunityPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpiredPage } from "./pages/ExpiredPage";
import { LocationPage } from "./pages/LocationPage";
import { LoginPage } from "./pages/LoginPage";
import { MapPage } from "./pages/MapPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { RemoteAdminPage } from "./pages/RemoteAdminPage";
import { SOSActivePage } from "./pages/SOSActivePage";
import { ShareViewPage } from "./pages/ShareViewPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-center" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const expiredRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expired",
  component: ExpiredPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/map",
  component: MapPage,
});

const communityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community",
  component: CommunityPage,
});

const locationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/location",
  component: LocationPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const sosActiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sos-active",
  component: SOSActivePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const shareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/share/$id",
  component: ShareViewPage,
});

const remoteAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/remote-admin",
  component: RemoteAdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  expiredRoute,
  dashboardRoute,
  mapRoute,
  communityRoute,
  locationRoute,
  profileRoute,
  sosActiveRoute,
  adminRoute,
  shareRoute,
  remoteAdminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
