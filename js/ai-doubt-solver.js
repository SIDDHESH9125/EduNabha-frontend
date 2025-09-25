// AI Doubt Solver functionality for EduNabha
const aiDoubtSolver = {
    // Initialize the AI doubt solver
    init: function() {
        this.createDoubtSolverUI();
        this.setupEventListeners();
        console.log('AI Doubt Solver initialized');
    },

    // Create the AI doubt solver UI
    createDoubtSolverUI: function() {
        const doubtSolverContainer = document.createElement('div');
        doubtSolverContainer.className = 'ai-doubt-container';
        doubtSolverContainer.innerHTML = `
            <div class="ai-doubt-header">
                <h3 class="ai-doubt-title">AI Doubt Solver</h3>
                <button class="ai-doubt-toggle" id="ai-doubt-toggle">+</button>
            </div>
            <div class="ai-doubt-content" id="ai-doubt-content">
                <div class="ai-doubt-input-container">
                    <textarea class="ai-doubt-textarea" id="ai-doubt-question" 
                        placeholder="Type your doubt or question here..."></textarea>
                    <div class="ai-doubt-buttons">
                        <button class="ai-doubt-button clear" id="ai-doubt-clear">Clear</button>
                        <button class="ai-doubt-button" id="ai-doubt-submit">Ask AI</button>
                    </div>
                </div>
                <div class="ai-doubt-response" id="ai-doubt-response" style="display: none;">
                    <div class="ai-doubt-response-title">AI Response:</div>
                    <div class="ai-doubt-response-content" id="ai-doubt-response-content"></div>
                </div>
                <div class="ai-doubt-loading" id="ai-doubt-loading" style="display: none;">
                    <div class="ai-doubt-loading-spinner"></div>
                </div>
            </div>
        `;

        // Add the doubt solver to the main content area
        const mainContent = document.querySelector('.main-content') || document.body;
        mainContent.appendChild(doubtSolverContainer);
    },

    // Set up event listeners for the AI doubt solver
    setupEventListeners: function() {
        // Toggle the doubt solver content
        const toggleButton = document.getElementById('ai-doubt-toggle');
        const doubtContent = document.getElementById('ai-doubt-content');
        
        if (toggleButton && doubtContent) {
            toggleButton.addEventListener('click', () => {
                doubtContent.classList.toggle('active');
                toggleButton.textContent = doubtContent.classList.contains('active') ? '-' : '+';
            });
        }

        // Submit button event listener
        const submitButton = document.getElementById('ai-doubt-submit');
        if (submitButton) {
            submitButton.addEventListener('click', () => this.handleDoubtSubmission());
        }

        // Clear button event listener
        const clearButton = document.getElementById('ai-doubt-clear');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearDoubtForm());
        }
    },

    // Handle doubt submission
    handleDoubtSubmission: async function() {
        const questionInput = document.getElementById('ai-doubt-question');
        const responseContainer = document.getElementById('ai-doubt-response');
        const responseContent = document.getElementById('ai-doubt-response-content');
        const loadingIndicator = document.getElementById('ai-doubt-loading');
        
        if (!questionInput || !responseContainer || !responseContent || !loadingIndicator) {
            console.error('Required elements not found');
            return;
        }

        const question = questionInput.value.trim();
        if (!question) {
            alert('Please enter your question or doubt');
            return;
        }

        // Show loading indicator and hide previous response
        loadingIndicator.style.display = 'flex';
        responseContainer.style.display = 'none';

        try {
            // Try to get response from API first
            const response = await this.getAIResponse(question);
            
            // Display the response
            responseContent.textContent = response;
            responseContainer.style.display = 'block';
        } catch (error) {
            console.error('Error getting AI response:', error);
            
            // Fallback to offline responses
            const offlineResponse = this.getOfflineResponse(question);
            responseContent.textContent = offlineResponse;
            responseContainer.style.display = 'block';
        } finally {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
        }
    },

    // Get AI response from the API
    getAIResponse: async function(question) {
        // Check if online
        if (!navigator.onLine) {
            throw new Error('Offline mode');
        }

        const token = localStorage.getItem('token');
        const apiUrl = '/api/ai-doubt-solver';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                throw new Error('API response error');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },

    // Get offline response based on keywords in the question
    getOfflineResponse: function(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Simple keyword-based responses for offline mode
        if (lowerQuestion.includes('math') || lowerQuestion.includes('equation') || 
            lowerQuestion.includes('formula') || lowerQuestion.includes('calculation')) {
            return "For mathematical problems, try breaking them down step by step. Remember to apply the correct order of operations (PEMDAS: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction). If you're stuck with algebra, try isolating the variable on one side of the equation.";
        }
        
        if (lowerQuestion.includes('science') || lowerQuestion.includes('physics') || 
            lowerQuestion.includes('chemistry') || lowerQuestion.includes('biology')) {
            return "For science questions, start by identifying the core concepts involved. In physics, remember the fundamental laws like Newton's laws of motion or conservation of energy. For chemistry, consider atomic structure and chemical bonding principles. In biology, think about cellular processes and evolutionary concepts.";
        }
        
        if (lowerQuestion.includes('computer') || lowerQuestion.includes('programming') || 
            lowerQuestion.includes('code') || lowerQuestion.includes('algorithm')) {
            return "When dealing with programming problems, break down the task into smaller steps. Think about the inputs, processing, and outputs. Check for syntax errors and logical errors separately. Remember to test your code with different inputs to ensure it works correctly in all scenarios.";
        }
        
        if (lowerQuestion.includes('language') || lowerQuestion.includes('grammar') || 
            lowerQuestion.includes('writing') || lowerQuestion.includes('essay')) {
            return "For language and writing questions, focus on clarity and structure. Make sure your sentences have proper subject-verb agreement. Organize your thoughts with clear introduction, body, and conclusion. Use appropriate transitions between ideas, and always proofread your work for spelling and grammatical errors.";
        }
        
        // Default response for other types of questions
        return "I'm currently in offline mode and can't provide a specific answer to your question. When you're back online, I'll be able to give you a more detailed response. In the meantime, try searching for related topics in the available offline lessons and resources.";
    },

    // Clear the doubt form
    clearDoubtForm: function() {
        const questionInput = document.getElementById('ai-doubt-question');
        const responseContainer = document.getElementById('ai-doubt-response');
        
        if (questionInput) {
            questionInput.value = '';
        }
        
        if (responseContainer) {
            responseContainer.style.display = 'none';
        }
    }
};

// Initialize the AI doubt solver when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    aiDoubtSolver.init();
});