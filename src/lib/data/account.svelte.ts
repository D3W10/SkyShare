import { app } from "./app.svelte";
import { info } from "./info.svelte";
import type { StoreAccount } from "$electron/lib/interfaces/Store.interface";
import type { File } from "$electron/lib/interfaces/File.interface";
import type { HistoryEntry } from "$lib/models/HistoryEntry.interface";

interface AccountState {
    loggedIn: boolean;
    id: string;
    username: string;
    email: string;
    picture: string;
    emailVerified: boolean;
    createdAt: Date;
    auth: Required<StoreAccount> & {
        accessToken: string,
        expiresOn: number
    };
    historyDate: Date;
    history: HistoryEntry[];
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
    },
    historyDate: new Date(0),
    history: []
};

export const account = $state<AccountState>(defaultState);

export function getLogin() {
    return `${info.api}/login?redirect_uri=skyshare://account/login/complete&display=${info.isDev}`;
}

export function getSignup() {
    return `${info.api}/signup?redirect_uri=skyshare://account/login/complete&display=${info.isDev}`;
}

export async function getToken() {
    if (!account.auth.accessToken || Date.now() >= account.auth.expiresOn) {
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

        app.saveCredentials(account.auth.refreshToken);

        return account.auth.accessToken;
    }
    else
        return account.auth.accessToken;
}

export async function login(accessToken: string, refreshToken: string, expiresOn: number) {
    console.log("Logging in");

    app.saveCredentials(refreshToken);
    account.auth.accessToken = accessToken;
    account.auth.expiresOn = expiresOn;

    return loginComplete(refreshToken);
}

export async function loginStored() {
    const storedInfo = app.getSetting("account") as StoreAccount;

    if (storedInfo.refreshToken)
        return loginComplete(storedInfo.refreshToken);
    else
        return false;
}

async function loginComplete(refreshToken: string) {
    account.auth.refreshToken = refreshToken;

    const [error, userInfo] = await app.authCall("/api/get-account", {
        headers: {
            Authorization: `Bearer ${await getToken()}`
        }
    });

    if (!error) {
        account.loggedIn = true;
        account.id = userInfo.data.id;
        account.username = userInfo.data.name;
        account.email = userInfo.data.email;
        account.picture = userInfo.data.avatar;
        account.emailVerified = userInfo.data.emailVerified;
        account.createdAt = new Date(userInfo.data.createdTime);

        console.log("Login successful!");
    }

    return !error;
}

export async function editInfo(username?: string, email?: string) {
    const body: { [key: string]: any } = {};

    if (username)
        body.username = username;
    if (email)
        body.email = email;

    const [error, data] = await app.apiCall<{ username: string, email: string }>("/user/info", {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${await getToken()}`
        },
        body
    });

    if (!error)
        account.email = data.email;

    return !error;
}

export async function changePicture(picture: string) {
    const [error0, userInfo] = await app.authCall("/api/get-account", {
        headers: {
            Authorization: `Bearer ${await getToken()}`
        }
    });

    if (error0)
        return false;

    if (picture) {
        const extension = /\.\w+$/g.exec(picture);
        const query = new URLSearchParams({
            owner: info.org,
            user: account.id,
            application: userInfo.data.signupApplication,
            fullFilePath: account.username.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "_") + (extension && extension.length ? extension[0] : ".jpg")
        });

        const formData = new FormData();
        formData.append("file", await (await fetch(picture)).blob());

        const picUploadReq = await fetch(info.auth + "/api/upload-resource?" + query.toString(), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${await getToken()}`
            },
            body: formData
        }), picUpload = await picUploadReq.json();

        if (picUpload.status !== "ok")
            return false;

        picture = picUpload.data;
    }

    userInfo.data.avatar = picture;

    const [error1] = await app.authCall("/api/update-user", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await getToken()}`
        },
        body: userInfo.data
    });

    if (!error1)
        account.picture = picture;

    return !error1;
}

export async function changePassword(oldPassword: string, newPassword: string) {
    const formData = new FormData();
    formData.append("userOwner", info.org);
    formData.append("userName", account.username);
    formData.append("oldPassword", oldPassword);
    formData.append("newPassword", newPassword);

    const changeReq = await fetch(info.auth + "/api/set-password", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await getToken()}`
        },
        body: formData
    }), change = await changeReq.json();

    return {
        success: change.status === "ok",
        message: change.msg
    };
}

export async function getHistory() {
    if (Date.now() > account.historyDate.getTime() + 300000) {
        const [error, history] = await app.apiCall<any[]>("/history", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${await getToken()}`
            }
        });

        if (!error) {
            account.historyDate = new Date();
            account.history = history.map(e => ({ ...e, createdAt: new Date(e.createdAt) }) as HistoryEntry);
        }

        return !error;        
    }

    return true;
}

export async function pushHistory(files: File[], message: string | null, receiver: string | null) {
    const [error] = await app.apiCall("/history", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await getToken()}`
        },
        body: {
            files: files.map(f => ({ name: f.name, size: f.size })),
            message,
            sender: account.loggedIn ? account.id : null,
            receiver
        }
    });

    return !error;
}

export async function deleteAccount() {
    const deleteReq = await fetch(info.auth + "/api/delete-user", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
            id: account.id,
            name: account.username,
            email: account.email,
            owner: info.org
        })
    }), del = await deleteReq.json();

    return del.status === "ok";
}

export function logout() {
    app.logout();

    for (const key of Object.keys(account) as (keyof AccountState)[])
        (account as any)[key] = defaultState[key];
}