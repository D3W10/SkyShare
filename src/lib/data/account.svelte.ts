import { info } from "./info.svelte";

interface AccountState {
    loggedIn: boolean;
    username: string;
    email: string;
    picture: string | undefined;
    emailVerified: boolean;
    auth: {
        accessToken: string;
        refreshToken: string;
        expireDate: number;
    };
}

export const account = $state<AccountState>({
    loggedIn: false,
    username: "",
    email: "",
    picture: undefined,
    emailVerified: false,
    auth: {
        accessToken: "",
        refreshToken: "",
        expireDate: 0
    }
});

export function getLogin() {
    return `${info.api}login?redirect_uri=skyshare://account/login/complete&display=${info.isDev}`;
}

export function getSignup() {
    return `${info.api}signup?redirect_uri=skyshare://account/login/complete&display=${info.isDev}`;
}

export async function finishLogin(accessToken: string, refreshToken: string, expiresIn: number) {
    console.log("Storing user tokens");

    account.auth.accessToken = accessToken;
    account.auth.refreshToken = refreshToken;
    account.auth.expireDate = Date.now() + expiresIn;

    try {
        const userInfoReq = await fetch(info.auth + "api/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }), userInfo = await userInfoReq.json();

        account.loggedIn = true;
        account.username = userInfo.preferred_username;
        account.email = userInfo.email;
        account.picture = userInfo.picture;
        account.emailVerified = userInfo.email_verified;

        return true;
    }
    catch {
        /* TODO: Handle error */
        return false;
    }
}