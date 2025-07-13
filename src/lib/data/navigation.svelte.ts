export const navigation = $state<string[]>([]);

let currentPage = "", rollingBack = false;

const privatePages = [
    "/splash",
    "/send/waiting",
    "/send/transfer",
    "/send/done",
    "/receive/transfer",
    "/receive/done",
    "/account/login/complete",
    "/account/delete/confirm"
];

export function push(pathname: string) {
    const getCategory = (path: string) => (/^\/\w+/.exec(path) ?? [""])[0];
    const lastPageCategory = getCategory(currentPage), currentPageCategory = getCategory(pathname);

    if (!rollingBack) {
        if (lastPageCategory !== currentPageCategory)
            navigation.length = 0;
        else if (currentPage && !privatePages.includes(currentPage))
            navigation.push(currentPage);
    }
    else
        rollingBack = false;

    currentPage = pathname;
}

export function pop() {
    rollingBack = true;
    return navigation.pop();
}