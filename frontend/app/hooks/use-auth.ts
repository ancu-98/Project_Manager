import { postData } from "@/lib/fetch-util";
import type { SignUpFormData } from "@/routes/auth/sign-up.tsx";
import { useMutation } from "@tanstack/react-query"

export const userSignUpMutation = () => {
    return useMutation({
        mutationFn: (data: SignUpFormData) => postData('/auth/register', data),
    });
};