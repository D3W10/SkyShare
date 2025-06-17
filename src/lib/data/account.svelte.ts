import { info } from "./info.svelte";

export const account = $state({
    loggedIn: false,
    username: "",
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
    
        console.log(userInfo);
    }
    catch {}
}