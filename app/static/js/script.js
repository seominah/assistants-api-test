document.addEventListener('DOMContentLoaded', () => {
    let threadId = null;
    let sessionId = document.getElementById('session-info')?.getAttribute('data-session-id');
    let chatIndex = 1; // Initialize the chat index

    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const deleteButton = document.getElementById('deleteButton');
    const chatList = document.getElementById('chat-list');

    // 햄버거 버튼 메뉴로 대화 목록 숨기기/펼치기 UI 변경
    const toggleMenuButton = document.getElementById('toggleMenuButton');
    const toggleMenuButtonInChat = document.getElementById('toggleMenuButtonInChat');
    const newChatButton = document.getElementById('newChat');
    const body = document.body; // 전체 body 요소 가져오기

    if (!chatMessagesContainer || !userInput || !sendButton || !chatList) {
        console.error('Required DOM elements are missing.');
        return;
    }

    toggleMenuButton.addEventListener('click', () => {
        // 'hide-list' 클래스를 토글하여 사이드바 숨김/보이기
        console.log('햄버거 버튼 클릭됨');
        body.classList.toggle('hide-list');
        toggleMenuButtonInChat.classList.toggle('d-none'); // 대화창 내부 버튼 표시
    });

    toggleMenuButtonInChat.addEventListener('click', () => {
        console.log("대화창 내 햄버거 버튼 클릭됨");
        body.classList.toggle('hide-list');
        toggleMenuButtonInChat.classList.toggle('d-none');  // 내부 버튼을 숨김
        
    });

    newChatButton.addEventListener('click', () => {
        // 새로운 대화 시작하기 기능 구현
        console.log('새로운 대화 시작하기 버튼 클릭됨');
        // 필요한 기능 구현 추가
        startNewChat();
    });

    const startNewChat = async () => {
        try {
            const response = await fetch('/api/thread/new');
            const data = await response.json();
            const newThreadId = data.thread_id;
            
            // Increment the chat index and update the title
            const chatTitle = `Hansol HR BOT${chatIndex++}`;

            const newChatItem = document.createElement('a');
            newChatItem.href = "#";
            newChatItem.className = "list-group-item list-group-item-action";
            newChatItem.setAttribute('data-thread-id', newThreadId);
            newChatItem.innerHTML = `
                <div class="d-flex chat-box">
                    <div class="chat-title ${newThreadId}">${chatTitle}</div>
                    <i class="fas fa-times delete-button"></i>
                </div>
            `;
    
            const deleteButton = newChatItem.querySelector('.delete-button');
            deleteButton.addEventListener('click', async (e) => {
                e.preventDefault(); 
                e.stopPropagation();

                const confirmDelete = confirm('이 채팅 스레드를 삭제하시겠습니까?');
                if (!confirmDelete) return;

                try {
                    const deleteResponse = await fetch(`/api/chat/delete`, { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ newThreadId }),  
                    });

                    if (!deleteResponse.ok) {
                        const errorText = await deleteResponse.text();
                        throw new Error(`Failed to delete thread: ${errorText}`);
                    } else {                
                        const chatMessages = document.getElementById(`chat-messages-${newThreadId}`);
                        if (chatMessages) {
                            chatMessages.remove();
                            console.log(`Messages for thread ${newThreadId} deleted successfully.`);
                        }
                        
                        newChatItem.remove(); 
                        console.log(`Thread ${newThreadId} deleted successfully.`);
                    }

                } catch (error) {
                    console.error('Error while deleting the thread:', error);
                }
            });
    
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
            // '\n'을 '<br>'로 대체 (줄바꿈 표현)
            const formattedMessage = userInput.value.replace(/\n/g, '<br>');
            displayMessage('user', formattedMessage, threadId);

            // 입력 필드와 버튼 비활성화
            disableInputs();

            fetchMessageFromServer(message, threadId);
        }

        const chatTitle = document.querySelector('.' + threadId)
        let title = message

        if (title.length > 15)
            title = title.slice(0, 15) + '...'

        chatTitle.textContent = title
    };

    const fetchMessageFromServer = (message, threadId) => {
        //const loadingMessage = displayMessage('bot', '로딩 중', threadId, true);
        const loadingMessage = displayLoadingMessage(threadId);

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
                            <img src="static/image/logo_test.png" class="align-self-start mr-2 chat-logo">
                            <div class="media-body text-left">
                                <p class="mb-1 message-bubble bot-bubble">${buffer.replace(/\n/g, '<br>')}</p>
                                <p class="text-muted small">${new Date().toLocaleTimeString()} | ${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        `;
                    } else {
                        displayMessage('bot', buffer, threadId);
                    }

                    // 응답이 완료된 후 입력 필드와 버튼을 활성화
                    enableInputs();
                    return;
                }

                buffer += decoder.decode(value, { stream: true });

                if (!messageElement) {
                    messageElement = displayMessage('bot', '', threadId);
                }

                messageElement.innerHTML = `
                <div class="d-flex">
                    <img src="static/image/logo_test.png" class="align-self-start mr-2 chat-logo">
                    <div class="media-body text-left">
                        <p class="mb-1 message-bubble bot-bubble">${buffer.replace(/\n/g, '<br>')}</p>
                        <p class="text-muted small">${new Date().toLocaleTimeString()} | ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                `;

                scrollToBottom(); // 메시지 추가 후 스크롤을 아래로 이동
                return reader.read().then(processText);
            });
        })
        .catch(error => {
            loadingMessage.innerHTML = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            console.error('Error:', error);

            // 에러 발생 시에도 입력 필드와 버튼을 활성화
            enableInputs();
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
            </div>
            `;
        } else {
            messageElement.innerHTML = `
            <div class="d-flex">
                <img src="static/image/logo_test.png" class="align-self-start mr-2 chat-logo">
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

        // 스크롤을 최하단으로 이동
        scrollToBottom();
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
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 기본 Enter 키의 줄바꿈을 막습니다.
            sendMessage(); // 메시지를 전송합니다.
        }
    });

    // Initialize the first chat
    startNewChat();
});

// 스크롤 하단 이동 함수
function scrollToBottom() {
    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    console.log(`Scroll to bottom: scrollHeight = ${chatMessagesContainer.scrollHeight}, scrollTop = ${chatMessagesContainer.scrollTop}`);
}

// 입력 필드와 버튼 비활성화 함수
function disableInputs() {
    sendButton.disabled = true;
    sendButton.style.backgroundColor = 'grey'; // 비활성화 시 회색으로
    sendButton.style.cursor = 'not-allowed'; // 커서를 사용 불가로 변경

    userInput.disabled = true; // 입력 필드 비활성화
    userInput.style.backgroundColor = '#e9ecef'; // 비활성화 시 배경색
}

// 입력 필드와 버튼 활성화 함수
function enableInputs() {    
    userInput.value = '';
    sendButton.disabled = false;
    sendButton.style.backgroundColor = '#3465A7'; // 활성화 시 원래 색상으로
    sendButton.style.cursor = 'pointer'; // 커서를 기본 상태로 변경

    userInput.disabled = false; // 입력 필드 활성화
    userInput.style.backgroundColor = '#ffffff'; // 활성화 시 원래 배경색
    
    userInput.focus();
}

// 로딩 메시지를 GIF 이미지로 표현
const displayLoadingMessage = (threadId) => {
    const chatMessages = document.getElementById(`chat-messages-${threadId}`);
    if (!chatMessages) return null;

    const loadingElement = document.createElement('div');
    loadingElement.classList.add('message', 'bot-message');

    // 로딩 중인 GIF 이미지 추가
    loadingElement.innerHTML = `
    <div class="d-flex">
        <img src="static/image/loading_document.gif" class="align-self-start mr-2" alt="Loading...">
        <div class="media-body text-left">
        </div>
    </div>
    `;

    chatMessages.appendChild(loadingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingElement;
};

console.log('Script loaded');
