import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("routes/auth/auth-layout.tsx",[
        index("routes/root/home.tsx"),
        route("sign-in","routes/auth/sign-in.tsx"),
        route("sign-up","routes/auth/sign-up.tsx"),
        route("forgot-password.tsx","routes/auth/forgot-password.tsx"),
        route("reset-password.tsx","routes/auth/reset-password.tsx"),
        route("verify-email.tsx","routes/auth/verify-email.tsx"),

    ]),
] satisfies RouteConfig;
