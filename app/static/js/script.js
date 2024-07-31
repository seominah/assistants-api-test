document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.querySelector('button');

    const sendMessage = () => {
        const message = userInput.value.trim();
        if (message) {
            displayMessage('user', message);
            fetchMessageFromServer(message);
            userInput.value = '';
        }
    };

    const fetchMessageFromServer = (message) => {
        const loadingMessage = displayMessage('bot', '로딩 중', true);
        
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        })
        .then(response => {
            if (!response.body) {
                throw new Error('응답이 없습니다. 잠시 후 다시 시도해주세요.');
            }
            console.error('Error!!!!!:', response);
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let messageElement = null;

            return reader.read().then(function processText({ done, value }) {
                let roadingDiv = document.getElementById('roading');
                if (roadingDiv) {
                    roadingDiv.remove();
                }
                if (done) {
                    if (messageElement) {
                        messageElement.innerHTML += buffer.replace(/\n/g, '<br>');
                    } else {
                        displayMessage('bot', buffer);
                    }
                    return;
                }

                buffer += decoder.decode(value, { stream: true });

                if (!messageElement) {
                    messageElement = displayMessage('bot', '');
                }

                const span = document.createElement('span');
                span.innerHTML = buffer.replace(/\n/g, '<br>');
                messageElement.appendChild(span);
                
                buffer = '';

                return reader.read().then(processText);
            });
        })
        .catch(error => {
            loadingMessage.innerHTML = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            console.error('Error:', error);
        });
    };

    const displayMessage = (sender, message, plag) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerHTML = message.replace(/\n/g, '<br>');
        if (plag) {
            messageElement.id = "roading"
        } 
        chatMessages.appendChild(messageElement);
        // chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
        console.log(messageElement);
        return messageElement;
    };

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

console.log('Script loaded');
