document.addEventListener('DOMContentLoaded', () => {
    let threadId = null;
    let sessionId = document.getElementById('session-info')?.getAttribute('data-session-id');

    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const chatList = document.getElementById('chat-list');

    if (!chatMessagesContainer || !userInput || !sendButton || !chatList) {
        console.error('Required DOM elements are missing.');
        return;
    }

    const startNewChat = async () => {
        try {
            const response = await fetch('/api/thread/new');
            const data = await response.json();
            const newThreadId = data.thread_id;

            const newChatItem = document.createElement('a');
            newChatItem.href = "#";
            newChatItem.className = "list-group-item list-group-item-action";
            newChatItem.setAttribute('data-thread-id', newThreadId);
            newChatItem.innerHTML = `
                <p class="mb-1">안녕하세요! HR 관련 질문이 있으시면 언제든 물어보세요.</p>
            `;
            newChatItem.addEventListener('click', (e) => {
                e.preventDefault();
                loadThread(newThreadId);
            });
            chatList.appendChild(newChatItem);

            createChatMessages(newThreadId);
            switchToThread(newThreadId);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const createChatMessages = (threadId) => {
        const chatMessages = document.createElement('div');
        chatMessages.classList.add('chat-messages');
        chatMessages.id = `chat-messages-${threadId}`;
        chatMessagesContainer.appendChild(chatMessages);
    };

    const switchToThread = (threadIdToLoad) => {
        threadId = threadIdToLoad;
        Array.from(chatMessagesContainer.children).forEach(child => {
            if (child.id === `chat-messages-${threadIdToLoad}`) {
                child.classList.add('active');
                child.style.display = 'block';
            } else {
                child.classList.remove('active');
                child.style.display = 'none';
            }
        });
    };

    const sendMessage = () => {
        const message = userInput.value.trim();
        if (message) {
            displayMessage('user', message, threadId);
            fetchMessageFromServer(message, threadId);
            userInput.value = '';
        }
    };

    const fetchMessageFromServer = (message, threadId) => {
        const loadingMessage = displayMessage('bot', '로딩 중', threadId, true);

        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, threadId }),
        })
        .then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let messageElement = loadingMessage;

            return reader.read().then(function processText({ done, value }) {
                if (done) {
                    if (messageElement) {
                        messageElement.innerHTML = `
                        <div class="d-flex">
                            <img src="https://via.placeholder.com/40" class="align-self-start mr-2" alt="...">
                            <div class="media-body text-left">
                                <p class="mb-1 message-bubble bot-bubble">${buffer.replace(/\n/g, '<br>')}</p>
                                <p class="text-muted small">${new Date().toLocaleTimeString()} | ${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        `;
                    } else {
                        displayMessage('bot', buffer, threadId);
                    }
                    return;
                }

                buffer += decoder.decode(value, { stream: true });

                if (!messageElement) {
                    messageElement = displayMessage('bot', '', threadId);
                }

                messageElement.innerHTML = `
                <div class="d-flex">
                    <img src="https://via.placeholder.com/40" class="align-self-start" alt="...">
                    <div class="media-body text-left">
                        <p class="mb-1 message-bubble bot-bubble">${buffer.replace(/\n/g, '<br>')}</p>
                        <p class="text-muted small">${new Date().toLocaleTimeString()} | ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                `;

                return reader.read().then(processText);
            });
        })
        .catch(error => {
            loadingMessage.innerHTML = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            console.error('Error:', error);
        });
    };

    const displayMessage = (sender, message, threadId, isLoading = false) => {
        const chatMessages = document.getElementById(`chat-messages-${threadId}`);
        if (!chatMessages) return null;

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        if (sender === 'user') {
            messageElement.innerHTML = `
            <div class="d-flex">
                <div class="media-body text-right">
                    <p class="mb-1 message-bubble user-bubble">${message}</p>
                    <p class="text-muted small">${new Date().toLocaleTimeString()} | ${new Date().toLocaleDateString()}</p>
                </div>
                <img src="https://via.placeholder.com/40" class="align-self-start ml-2" alt="...">
            </div>
            `;
        } else {
            messageElement.innerHTML = `
            <div class="d-flex">
                <img src="https://via.placeholder.com/40" class="align-self-start mr-2" alt="...">
                <div class="media-body text-left">
                    <p class="mb-1 message-bubble bot-bubble">${message}</p>
                    <p class="text-muted small">${new Date().toLocaleTimeString()} | ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
            `;
        }
        if (isLoading) {
            messageElement.id = "roading";
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    };

    const loadThread = async (threadIdToLoad) => {
        switchToThread(threadIdToLoad);
        const chatMessages = document.getElementById(`chat-messages-${threadIdToLoad}`);
        if (!chatMessages || chatMessages.children.length > 0) return;

        try {
            const response = await fetch(`/get_thread_messages/${threadIdToLoad}`);
            const data = await response.json();
            data.messages.forEach(message => {
                displayMessage(
                    message.role === 'user' ? 'user' : 'bot',
                    message.content,
                    threadIdToLoad
                );
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    chatList.addEventListener('click', (e) => {
        if (e.target && e.target.matches('#newChat')) {
            startNewChat();
        }
    });

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Initialize the first chat
    startNewChat();
});

console.log('Script loaded');
