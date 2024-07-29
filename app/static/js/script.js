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

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let messageElement = null;

            return reader.read().then(function processText({ done, value }) {
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
            console.error('Error:', error);
        });
    };

    const displayMessage = (sender, message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerHTML = message.replace(/\n/g, '<br>');
        chatMessages.appendChild(messageElement);
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