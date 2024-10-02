document.addEventListener('DOMContentLoaded', () => {
    let threadId = null;
    let sessionId = document.getElementById('session-info')?.getAttribute('data-session-id');
    let chatIndex = 1; // Initialize the chat index
    
    const chatContainer = document.querySelector('.chat-container');
    const fileContainer = document.querySelector('.file-container');
    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    const referenceCardContainer = document.getElementById('referenceCardContainer');
    const fileReferencesList = document.getElementById('fileReferences');
    const userInput = document.getElementById('userInput');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const deleteButton = document.getElementById('deleteButton');
    const chatList = document.getElementById('chat-list');

    // 햄버거 버튼 메뉴로 대화 목록 숨기기/펼치기 UI 변경
    const toggleNav = document.getElementById('nav-toggle');
    const toggleMenuButton = document.getElementById('toggleMenuButton');
    const toggleMenuButtonInChat = document.getElementById('toggleMenuButtonInChat');
    const chatListButton = document.getElementById('chatList');
    const refDocsButton = document.getElementById('refDocs');
    const newChatButton = document.getElementById('newChat');
    const body = document.body; // 전체 body 요소 가져오기

    if (!chatMessagesContainer || !userInput || !sendButton || !chatList) {
        console.error('Required DOM elements are missing.');
        return;
    }

    toggleNav.addEventListener('click', () => {
        body.classList.toggle('hide-list');
    });

    chatListButton.addEventListener('click', () => {
        body.classList.toggle('hide-list');
        toggleMenuButtonInChat.classList.toggle('d-none');  // 내부 버튼을 숨김
    });

    refDocsButton.addEventListener('click', () => {
    
        // file-container가 보이는 상태인지 확인
        if (fileContainer.style.display === 'none' || fileContainer.style.display === '') {
            chatContainer.style.display = 'none';
            fileContainer.style.display = 'block';  // file-container 보이기
            
            // 모든 파일 URL 리스트 가져오기
            fetch('/api/all-file-urls')
            .then(response => response.json())
            .then(data => {
                const fileListElement = document.getElementById('fileList');
                fileListElement.innerHTML = ''; // 기존 리스트 비우기
                
                // 여러 파일을 리스트에 추가
                if (data && Object.keys(data).length > 0) {
                    for (const [fileName, fileUrl] of Object.entries(data)) {
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `<a href="${fileUrl}" target="_blank">${fileName}</a>`;
                        fileListElement.appendChild(listItem);
                    }
                } else {
                    fileListElement.innerHTML = '<li>파일이 없습니다.</li>';  // 파일이 없을 때 메시지
                }
            })
            .catch(error => {
                console.error('Error fetching all file URLs:', error);
            });
        } else {
            // file-container 숨기고 chat-container 다시 표시
            fileContainer.style.display = 'none';
            chatContainer.style.display = 'block';
        }
    });

    // 닫기 버튼 클릭 시 다시 chat-container를 보여줍니다.
    document.getElementById('closeRefList').addEventListener('click', function() {
        document.querySelector('.file-container').style.display = 'none';
        document.querySelector('.chat-container').style.display = 'block'; // chat-container 보이기
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
                <div class="d-flex mb-1 chat-box">
                    <div class="chat-title ${newThreadId}">${chatTitle}</div>
                    <i class="fa-regular fa-trash-can delete-button"></i>
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

        // const chatTitle = document.querySelector('.' + threadId)
        // let title = message

        // if (title.length > 15)
        //     title = title.slice(0, 15) + '...'

        // chatTitle.textContent = title
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
            const uniqueId = `${threadId}-${Math.random().toString(36).substring(2, 15)}`;

            return reader.read().then(function processText({ done, value }) {
                if (done) {
                    if (messageElement) {
                        messageElement.innerHTML = `
                        <div class="d-flex">
                            <img src="static/image/logo_test.png" class="align-self-start mr-2 chat-logo">
                            <div class="media-body text-left">
                                <p class="mb-1 mr-1 message-bubble bot-bubble">${buffer.replace(/\n/g, '<br>')}</p>                                
                                <div class="card mt-1 message-bubble references-bubble" id="referenceCard-${uniqueId}">
                                    <div class="card-body">
                                        <p>로딩 중...</p> <!-- 여기 나중에 fetchFileReferences로 내용을 변경 -->
                                    </div>
                                </div>
                                <p class="text-muted small">${new Date().toLocaleTimeString()} | ${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        `;
                        fetchFileReferences(messageElement, uniqueId); // 파일 참조 정보를 가져오는 함수 호출
                    } else {
                        messageElement = displayMessage('bot', buffer, threadId);
                    }

                    // 응답이 완료된 후 입력 필드와 버튼을 활성화
                    enableInputs();
                    fetchChatTitle();
                    //fetchFileReferences(messageElement); // 현재 메시지 요소를 전달
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

    // API 호출하여 채팅방 타이틀을 가져오는 함수
    const fetchChatTitle = async () => {
        try {
            const response = await fetch('/api/chat-title'); // Flask API 엔드포인트 호출
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json(); // JSON 응답 파싱
            const chatTitle = data.chat_title; // 타이틀 추출
            console.log('채팅방 타이틀:', chatTitle);
            
            if (chatTitle) {
                // 채팅방 타이틀을 강제로 지정
                setChatTitle(chatTitle);
            }

        } catch (error) {
            console.error('Error fetching chat title:', error);
        }
    };

    // 채팅방 타이틀을 설정하는 함수
    const setChatTitle = (title) => {
        const chatTitleElement = document.querySelector('.' + threadId)
        if (chatTitleElement) {
            if(title)
                chatTitleElement.textContent = title; // 타이틀 설정
        }
    };

    // fetchFileReferences 함수에서 messageElement를 사용하여 출처 정보를 올바른 위치에 표시
    function fetchFileReferences(messageElement, uniqueId) {
        fetch('/api/file-references')
        .then(response => response.json())
        .then(data => {
            if (!messageElement) return; // 메시지 요소가 없으면 종료

            console.log("data.file_references.length", data.file_references.length);
            console.log("data.file_references", data.file_references);
            const referenceBubble = document.getElementById(`referenceCard-${uniqueId}`);
        
            // 출처 파일이 있는지 확인하고 없으면 bubble 제거
            if (data.file_references && data.file_references.length > 0) {
                updateReferenceCard(data.file_references, messageElement, uniqueId); // 메시지 요소 참조를 전달하여 올바른 위치에 업데이트
            } else {                
                console.log("출처파일없음: ", referenceBubble);
                if (referenceBubble) {
                    referenceBubble.style.display = 'none'; // 숨기기
                    setTimeout(() => {
                        referenceBubble.remove(); // 일정 시간 후에 DOM에서 제거
                        console.log('Reference bubble removed.');
                    }, 100); // DOM 업데이트 후 제거
                } else {
                    console.log('Reference bubble not found.');
                }
            }
        })
        .catch(error => console.error('Error fetching file references:', error));
    }

    // 출처 카드를 업데이트하는 함수
    function updateReferenceCard(fileReferences, messageElement, uniqueId) {
        const referenceCard = messageElement.querySelector(`#referenceCard-${uniqueId}`);
        if (!referenceCard) return; // 참조 카드가 없으면 종료

        // 출처 파일 리스트가 비어 있는지 확인
        if (!fileReferences || fileReferences.length === 0) {
            referenceCard.innerHTML = ''; // 파일 참조가 없으면 내용 지우기
        } else {
            referenceCard.innerHTML = `
            <div class="card-body">
                <h5 style="font-size: 13px;">출처 파일:</h5>
                <ul class="list-unstyled" style="font-size: 11px;">
                    ${fileReferences.map(file => `<li><a href="#" onclick="fetchFileUrl('${file}')">${file}</a></li>`).join('')}
                </ul>
            </div>
            `;
        }

        // const referenceCardContainer = document.createElement('div');
        // referenceCardContainer.classList.add('card', 'mt-1', 'references-bubble');
        // referenceCardContainer.innerHTML = `
        //     <div class="card-body">
        //         <h5 style="font-size: 13px;">출처 파일:</h5>
        //         <ul class="list-unstyled" style="font-size: 11px;">
        //             ${fileReferences.map(file => `<li><a href="#" onclick="handleFileClick('${file}')">${file}</a></li>`).join('')}
        //         </ul>
        //     </div>
        // `;

        // messageElement.parentNode.insertBefore(referenceCardContainer, messageElement.nextSibling); // 메시지 바로 아래에 출처 카드 추가
    }

    // 파일 URL을 가져오는 함수
    window.fetchFileUrl = function(fileName) {
        fetch(`/api/get-file-url?fileName=${encodeURIComponent(fileName)}`)
        .then(response => response.json())
        .then(data => {
            console.log("URL : "+data);
            if (data.url) {
                window.open(data.url, '_blank'); // URL을 새 창에서 엽니다
            } else {
                console.error('URL not found for file:', fileName);
            }
        })
        .catch(error => console.error('Error fetching URL for file:', error));
    }
    


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
    // console.log(`Scroll to bottom: scrollHeight = ${chatMessagesContainer.scrollHeight}, scrollTop = ${chatMessagesContainer.scrollTop}`);
}

// 입력 필드와 버튼 비활성화 함수
function disableInputs() {
    sendButton.disabled = true;
    sendButton.classList.add('disabled-button'); // 비활성화 스타일 클래스를 추가
    sendButton.style.cursor = 'not-allowed'; // 커서를 사용 불가로 변경

    userInput.disabled = true; // 입력 필드 비활성화
    chatInput.style.backgroundColor = '#e9ecef'; // 비활성화 시 배경색
    userInput.style.backgroundColor = '#e9ecef'; // 비활성화 시 배경색
}

// 입력 필드와 버튼 활성화 함수
function enableInputs() {    
    userInput.value = '';
    sendButton.disabled = false;
    sendButton.classList.remove('disabled-button'); // 비활성화 스타일 클래스를 제거
    sendButton.style.cursor = 'pointer'; // 커서를 기본 상태로 변경

    userInput.disabled = false; // 입력 필드 활성화
    chatInput.style.backgroundColor = '#ffffff'; // 활성화 시 원래 배경색
    userInput.style.backgroundColor = '#ffffff'; // 활성화 시 원래 배경색

    chatInput.style.height = '60px'; // 초기 높이로 재설정
    userInput.style.height = '50px'; // 초기 높이로 재설정
    
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

function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto'; 
    const padding = 10; // textarea와 chatInput에 적용할 패딩 값
    const maxHeight = 140; // textarea의 최대 높이
    const newHeight = textarea.scrollHeight - padding;

    // 현재 텍스트 줄 수를 계산
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10);
    const currentLines = Math.floor(newHeight / lineHeight);

    // console.log("lineHeight : ",lineHeight);
    // console.log("currentLines : ",currentLines);

    // console.log(textarea.scrollHeight) // 21씩 증가
    // 최소 줄 수를 유지하고 싶으면 여기서 한 줄 또는 특정 높이로 고정
    if (currentLines <= 2) {
        textarea.style.height = '40px'; // 초기 높이 설정 (예: 40px)
        return;
    }

    if (newHeight > maxHeight) {
        textarea.style.height = maxHeight + 'px';
        textarea.style.overflowY = 'auto'; // 스크롤바 보이기
    } else {
        textarea.style.height = (newHeight-padding) + 'px';
        textarea.style.overflowY = 'hidden'; // 스크롤바 숨기기
    }

    const chatInput = document.getElementById('chatInput');
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(newHeight + 30, 180) + 'px'; // 패딩을 고려한 높이 계산
}










console.log('Script loaded');
