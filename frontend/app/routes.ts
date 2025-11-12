import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("routes/auth/auth-layout.tsx",[
        index("routes/root/home.tsx"),
        route("sign-in","routes/auth/sign-in.tsx"),
        route("sign-up","routes/auth/sign-up.tsx"),
        route("forgot-password","routes/auth/forgot-password.tsx"),
        route("reset-password","routes/auth/reset-password.tsx"),
        route("verify-email","routes/auth/verify-email.tsx"),

    ]),
    layout("routes/dashboard/dashboard-layout.tsx", [
        route("dashboard","routes/dashboard/app.tsx"),
        route("workspaces", "routes/dashboard/workspaces/app.tsx" ),
        route(
            "workspaces/:workspaceId",
            "routes/dashboard/workspaces/workspace-details.tsx"
        ),
        route(
            "workspaces/:workspaceId/projects/:projectId/backlog",
            "routes/dashboard/project/project-details.tsx"
        ),
        route(
            "workspaces/:workspaceId/projects/:projectId/backlog/activities/:activityId",
            "routes/dashboard/activity/activity-details.tsx"
        ),
        route(
            "workspaces/explore-workspaces",
            "routes/dashboard/workspaces/explore-workspaces.tsx"
        ),
        route(
            "workspaces/explore-workspaces/public/:workspaceId",
            "routes/dashboard/workspaces/public-workspace-details.tsx"
        ),
        route('my-activities', 'routes/dashboard/my-activities.tsx'),
        route('members', 'routes/dashboard/members.tsx'),
        // route('achieved', 'routes/dashboard/achieved.tsx'),
        route('settings', 'routes/dashboard/settings.tsx'),
    ]),
    route(
        "workspace-invite/:workspaceId",
        "routes/dashboard/workspaces/workspace-invite.tsx"
    ),
    route(
        "workspace-join-requests/:workspaceId",
        "routes/dashboard/workspaces/workspace-join-request.tsx"
    )


] satisfies RouteConfig;
