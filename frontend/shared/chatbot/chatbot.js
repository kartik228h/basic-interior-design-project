/**
 * Decora shared chatbot.
 * Included on every user-facing page except login.
 * loadPreviousSession restores the widget session across same-origin pages.
 * The n8n workflow must use persistent memory to restore the conversation.
 */
import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";

const webhookUrl =
  "https://decorachatbot.app.n8n.cloud/webhook/ff706ad7-8537-496c-8197-38bbf60ac060/chat";

const chatOpenStorageKey = "decora-chat-open";

function getFurnitureContext() {
  if (!window.location.pathname.includes("/furniture_details/")) {
    return undefined;
  }

  const furnitureId = new URLSearchParams(window.location.search).get("id");
  const storedFurniture = sessionStorage.getItem("selectedFurniture");
  if (!furnitureId || !storedFurniture) {
    return undefined;
  }

  let furniture;
  try {
    furniture = JSON.parse(storedFurniture);
  } catch (error) {
    console.error("Unable to read selected furniture for chat context.", error);
    return undefined;
  }

  if (!furniture || furniture.id !== furnitureId) {
    return undefined;
  }

  return {
    id: furniture.id,
    name: furniture.name,
    category: furniture.category,
    subcategory: furniture.subcategory,
    material: furniture.material,
    price: furniture.price,
    rating: furniture.rating,
  };
}

const furnitureContext = getFurnitureContext();

const isChatOpen = () => {
  const chatWindow = document.querySelector(".chat-window");
  return Boolean(chatWindow && getComputedStyle(chatWindow).display !== "none");
};

const saveChatState = (isOpen) => {
  localStorage.setItem(chatOpenStorageKey, String(isOpen));
};

const restoreChatState = (attempt = 0) => {
  if (localStorage.getItem(chatOpenStorageKey) !== "true") {
    return;
  }

  const toggle = document.querySelector(".chat-window-toggle");
  if (toggle && !isChatOpen()) {
    toggle.click();
    return;
  }

  if (attempt < 200) {
    window.setTimeout(() => restoreChatState(attempt + 1), 50);
  }
};

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (target.closest(".chat-window-toggle")) {
    window.setTimeout(() => saveChatState(isChatOpen()), 0);
  } else if (target.closest(".chat-close-button")) {
    saveChatState(false);
  }
});

createChat({
  webhookUrl,
  mode: "window",
  showWelcomeScreen: false,
  loadPreviousSession: true,
  metadata: {
    page: window.location.pathname,
    ...(furnitureContext ? { furniture: furnitureContext } : {}),
  },
  initialMessages: [
    "Hi! Welcome to Decora. 🏡",
    "I'm your AI interior design assistant. Tell me which room you'd like to transform, or upload a room photo to get started."
  ],
  i18n: {
    en: {
      title: "Decora Design Assistant",
      subtitle: "Ideas for a home that feels like yours.",
      footer: "",
      getStarted: "Start a conversation",
      inputPlaceholder: furnitureContext
        ? `Ask Decora about ${furnitureContext.name}...`
        : "Ask Decora about your home..."
    }
  }
});

restoreChatState();
