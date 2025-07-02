import { app } from "./app.svelte";
import { info } from "./info.svelte";
import type { StoreAccount } from "$electron/lib/interfaces/Store.interface";

interface AccountState {
    loggedIn: boolean;
    id: string;
    username: string;
    email: string;
    picture: string;
    emailVerified: boolean;
    createdAt: Date;
    auth: Required<StoreAccount>;
}

const defaultState: AccountState = {
    loggedIn: false,
    id: "",
    username: "",
    email: "",
    picture: "",
    emailVerified: false,
    createdAt: new Date(),
    auth: {
        accessToken: "",
        refreshToken: "",
        expiresOn: 0
    }
};

export const account = $state<AccountState>(defaultState);

export function getLogin() {
    return `${info.api}/login?redirect_uri=skyshare://account/login/complete&display=${info.isDev}`;
}

export function getSignup() {
    return `${info.api}/signup?redirect_uri=skyshare://account/login/complete&display=${info.isDev}`;
}

export async function getToken() {
    if (Date.now() >= account.auth.expiresOn) {
        const [error, data] = await app.apiCall<{ access_token: string, refresh_token: string, expires_on: number }>("/refresh", {
            method: "GET",
            params: (new URLSearchParams({
                refreshToken: account.auth.refreshToken
            })).toString()
        }, false);

        if (error) {
            logout();
            throw new Error("Failed to refresh token");
        }

        account.auth.accessToken = data.access_token;
        account.auth.refreshToken = data.refresh_token;
        account.auth.expiresOn = data.expires_on;

        app.saveCredentials(account.auth.accessToken, account.auth.refreshToken, account.auth.expiresOn);

        return account.auth.accessToken;
    }
    else
        return account.auth.accessToken;
}

export async function login(accessToken: string, refreshToken: string, expiresOn: number) {
    console.log("Logging in");

    app.saveCredentials(accessToken, refreshToken, expiresOn);
    return loginComplete(accessToken, refreshToken, expiresOn);
}

export async function loginStored() {
    const storedInfo = app.getSetting("account") as StoreAccount;

    if (storedInfo.accessToken && storedInfo.refreshToken && storedInfo.expiresOn)
        return loginComplete(storedInfo.accessToken, storedInfo.refreshToken, storedInfo.expiresOn);
    else
        return false;
}

async function loginComplete(accessToken: string, refreshToken: string, expiresOn: number) {
    account.auth.accessToken = accessToken;
    account.auth.refreshToken = refreshToken;
    account.auth.expiresOn = expiresOn;

    try {
        const userInfoReq = await fetch(info.auth + "/api/get-account", {
            headers: {
                Authorization: `Bearer ${await getToken()}`
            }
        }), userInfo = await userInfoReq.json();

        account.loggedIn = true;
        account.id = userInfo.data.id;
        account.username = userInfo.data.name;
        account.email = userInfo.data.email;
        account.picture = userInfo.data.avatar;
        account.emailVerified = userInfo.data.emailVerified;
        account.createdAt = new Date(userInfo.data.createdTime);

        console.log("Login successful!");

        return true;
    }
    catch {
        /* TODO: Handle error */
        return false;
    }
}

export async function editInfo(username: string, email: string) {
    const editReq = await fetch(info.auth + "/api/update-user", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
            id: account.id,
            name: username,
            displayName: username,
            email,
            avatar: account.picture,
            owner: "built-in"
        })
    }), edit = await editReq.json();

    const success = edit.status === "ok";
    if (success)
        account.email = email;

    return success;
}

export function logout() {
    app.logout();

    for (const key of Object.keys(account) as (keyof AccountState)[])
        (account as any)[key] = defaultState[key];
}