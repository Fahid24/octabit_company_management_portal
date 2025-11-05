// utils/generateRoutesFromNavLinks.js

import UserRoutes from "@/router/routeGuards/UserRoutes";

export function generateRoutesFromNav(navItems) {
    const routes = [];

    navItems.forEach((item) => {
        if (item.submenu) {
            item.submenu.forEach((sub) => {
                if (sub.component) {
                    routes.push({
                        path: sub.href,
                        element: (
                            <UserRoutes allowedRoles={sub.roles}>
                                <sub.component />
                            </UserRoutes>
                        ),
                    });
                }
            });
        } else if (item.component) {
            routes.push({
                path: item.href,
                element: (
                    <UserRoutes allowedRoles={item.roles}>
                        <item.component />
                    </UserRoutes>
                ),
            });
        }
    });

    return routes;
}
