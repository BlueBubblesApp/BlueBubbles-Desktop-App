import {chatPrevGetAllAction} from "./actions/ChatPrevGetAllAction";

/**
 * All application routes.
 */
export const AppRoutes = [
    {
        path: "/chatPrevs",
        method: "get",
        action: chatPrevGetAllAction
    }
];