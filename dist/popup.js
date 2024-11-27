"use strict";
/// <reference types="chrome"/>
var _a;
let accessToken = null;
let workspaces = [];
// Get Supabase session when popup opens
async function init() {
    var _a;
    try {
        const response = await fetch("https://app.learntime.ai/api/auth/session");
        const data = await response.json();
        if ((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) {
            accessToken = data.session.access_token;
            await fetchWorkspaces();
        }
        else {
            showError("Please log in to Learntime first");
        }
    }
    catch (error) {
        showError("Failed to get session");
    }
}
init();
async function fetchWorkspaces() {
    try {
        const response = await fetch("https://app.learntime.ai/api/workspaces", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        workspaces = await response.json();
        const select = document.getElementById("workspace-select");
        workspaces.forEach(workspace => {
            const option = document.createElement("option");
            option.value = workspace.id;
            option.textContent = workspace.name;
            select.appendChild(option);
        });
    }
    catch (error) {
        showError("Failed to fetch workspaces");
    }
}
(_a = document.getElementById("save-page")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", async () => {
    const workspaceId = document.getElementById("workspace-select").value;
    if (!workspaceId) {
        showError("Please select a workspace");
        return;
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id)
        return;
    // Get page content from content script
    chrome.tabs.sendMessage(tab.id, { action: "getPageContent" }, async (response) => {
        try {
            const result = await fetch("https://app.learntime.ai/api/create-topic-from-web", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    title: tab.title,
                    content: response.content,
                    url: tab.url,
                    workspaceId
                })
            });
            const data = await result.json();
            if (data.success) {
                showStatus("Page saved successfully!");
                // Open the new topic in a new tab
                chrome.tabs.create({
                    url: `https://app.learntime.ai/${workspaceId}/chat/${data.chatId}`
                });
            }
            else {
                showError(data.error);
            }
        }
        catch (error) {
            showError("Failed to save page");
        }
    });
});
function showError(message) {
    const status = document.getElementById("status");
    if (status) {
        status.textContent = message;
        status.className = "error";
    }
}
function showStatus(message) {
    const status = document.getElementById("status");
    if (status) {
        status.textContent = message;
        status.className = "";
    }
}
