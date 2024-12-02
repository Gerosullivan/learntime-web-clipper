/// <reference types="chrome"/>

let accessToken: string | null = null;
let workspaces: any[] = [];

// Get Supabase session when popup opens
async function init() {
  try {
    // Get current tab to pre-fill title
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const titleInput = document.getElementById(
      "title-input"
    ) as HTMLInputElement;
    if (titleInput && tab.title) {
      titleInput.value = tab.title;
    }

    const response = await fetch("https://app.learntime.ai/api/auth/session");
    const data = await response.json();
    if (data.session?.access_token) {
      accessToken = data.session.access_token;
      await fetchWorkspaces();
    } else {
      showError("Please log in to Learntime first");
    }
  } catch (error) {
    showError("Failed to get session");
  }
}

init();

async function fetchWorkspaces() {
  try {
    const response = await fetch("https://app.learntime.ai/api/workspaces", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    workspaces = await response.json();

    const select = document.getElementById(
      "workspace-select"
    ) as HTMLSelectElement;
    workspaces.forEach((workspace) => {
      const option = document.createElement("option");
      option.value = workspace.id;
      option.textContent = workspace.name;
      select.appendChild(option);
    });
  } catch (error) {
    showError("Failed to fetch workspaces");
  }
}

document.getElementById("save-page")?.addEventListener("click", async () => {
  const workspaceId = (
    document.getElementById("workspace-select") as HTMLSelectElement
  ).value;
  if (!workspaceId) {
    showError("Please select a workspace");
    return;
  }

  const titleInput = document.getElementById("title-input") as HTMLInputElement;
  const title = titleInput.value.trim();
  if (!title) {
    showError("Please enter a title");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return;

  // Show loading state
  const saveButton = document.getElementById("save-page") as HTMLButtonElement;
  const originalText = saveButton.textContent;
  saveButton.textContent = "Saving...";
  saveButton.disabled = true;

  // Get page content from content script
  chrome.tabs.sendMessage(
    tab.id,
    { action: "getPageContent" },
    async (response) => {
      try {
        const result = await fetch(
          "https://app.learntime.ai/api/create-topic-from-web",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              title: title,
              content: response.content,
              url: tab.url,
              workspaceId,
            }),
          }
        );

        const data = await result.json();
        if (data.success) {
          showStatus("Page saved successfully!");
          // Open the new topic in a new tab
          chrome.tabs.create({
            url: `https://app.learntime.ai/${workspaceId}/chat/${data.chatId}`,
          });
        } else {
          showError(data.error);
        }
      } catch (error) {
        showError("Failed to save page");
      } finally {
        // Reset button state
        saveButton.textContent = originalText;
        saveButton.disabled = false;
      }
    }
  );
});

function showError(message: string) {
  const status = document.getElementById("status");
  if (status) {
    status.textContent = message;
    status.className = "error";
  }
}

function showStatus(message: string) {
  const status = document.getElementById("status");
  if (status) {
    status.textContent = message;
    status.className = "";
  }
}
