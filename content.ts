/// <reference types="chrome"/>

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    // Get main content
    const content = extractMainContent()
    sendResponse({ content })
  }
  return true
})

function extractMainContent(): string {
  // Remove unwanted elements
  const elementsToRemove = document.querySelectorAll(
    "script, style, nav, header, footer, iframe, .ad, #comments, .comments"
  )
  elementsToRemove.forEach(el => el.remove())

  // Get text content from article or main content area
  const article = document.querySelector("article")
  const main = document.querySelector("main")
  const body = document.body

  let content = ""
  if (article) {
    content = article.textContent || ""
  } else if (main) {
    content = main.textContent || ""
  } else {
    // Fallback to body content
    content = body.textContent || ""
  }

  // Clean up the text
  return content.replace(/\s+/g, " ").trim().substring(0, 10000) // Limit content length
}
