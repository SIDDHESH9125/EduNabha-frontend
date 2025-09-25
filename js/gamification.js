// Gamification functionality for EduNabha
const gamification = {
    // User's current gamification data
    userData: null,
    
    // Initialize gamification features
    init: async function() {
        if (localStorage.getItem('token')) {
            try {
                await this.loadUserProgress();
                this.renderUserProgress();
                this.setupLeaderboard();
            } catch (error) {
                console.error('Error loading user progress:', error);
            }
        } else {
            // Add event listener to initialize after login
            document.addEventListener('userLoggedIn', async () => {
                await this.loadUserProgress();
                this.renderUserProgress();
                this.setupLeaderboard();
            });
        }
        
        // Initialize quiz functionality
        this.initQuizzes();
    },
    
    // Load user progress data from API
    loadUserProgress: async function() {
        try {
            const response = await fetchFromAPI('/progress/gamification');
            this.userData = response;
            return response;
        } catch (error) {
            console.error('Error loading user progress:', error);
            return null;
        }
    },
    
    // Render user progress in the UI
    renderUserProgress: function() {
        if (!this.userData) return;
        
        // Create or get progress container
        let progressContainer = document.getElementById('gamification-progress');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'gamification-progress';
            progressContainer.className = 'gamification-container';
            
            // Add to sidebar or appropriate container
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.appendChild(progressContainer);
            } else {
                document.querySelector('main').prepend(progressContainer);
            }
        }
        
        // Populate with user data
        progressContainer.innerHTML = `
            <div class="progress-card">
                <h3>Your Learning Journey</h3>
                <div class="progress-stats">
                    <div class="stat">
                        <span class="stat-value">${this.userData.level}</span>
                        <span class="stat-label">Level</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${this.userData.points}</span>
                        <span class="stat-label">Points</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${this.userData.streakDays}</span>
                        <span class="stat-label">Day Streak</span>
                    </div>
                </div>
                <div class="level-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.calculateLevelProgress()}%"></div>
                    </div>
                    <div class="progress-text">${this.calculateLevelProgress()}% to Level ${this.userData.level + 1}</div>
                </div>
                ${this.renderBadges()}
            </div>
        `;
    },
    
    // Calculate progress to next level (100 points per level)
    calculateLevelProgress: function() {
        if (!this.userData) return 0;
        const pointsInCurrentLevel = this.userData.points % 100;
        return Math.floor((pointsInCurrentLevel / 100) * 100);
    },
    
    // Render user badges
    renderBadges: function() {
        if (!this.userData || !this.userData.badges || this.userData.badges.length === 0) {
            return '<div class="badges-container"><p>Complete activities to earn badges!</p></div>';
        }
        
        let badgesHTML = '<div class="badges-container"><h4>Your Badges</h4><div class="badges-grid">';
        
        this.userData.badges.forEach(badge => {
            badgesHTML += `
                <div class="badge-item" title="${badge.description}">
                    <img src="${badge.imageUrl}" alt="${badge.name}" class="badge-icon">
                    <span class="badge-name">${badge.name}</span>
                </div>
            `;
        });
        
        badgesHTML += '</div></div>';
        return badgesHTML;
    },
    
    // Setup leaderboard
    setupLeaderboard: async function() {
        try {
            const response = await fetchFromAPI('/progress/leaderboard');
            
            // Create or get leaderboard container
            let leaderboardContainer = document.getElementById('leaderboard-container');
            if (!leaderboardContainer) {
                leaderboardContainer = document.createElement('div');
                leaderboardContainer.id = 'leaderboard-container';
                leaderboardContainer.className = 'leaderboard-container';
                
                // Add toggle button to sidebar
                const sidebarNav = document.querySelector('.sidebar-nav');
                if (sidebarNav) {
                    const leaderboardToggle = document.createElement('button');
                    leaderboardToggle.className = 'sidebar-item';
                    leaderboardToggle.innerHTML = '<i class="fas fa-trophy"></i> Leaderboard';
                    leaderboardToggle.addEventListener('click', () => {
                        document.getElementById('leaderboard-modal').classList.toggle('show');
                    });
                    sidebarNav.appendChild(leaderboardToggle);
                }
                
                // Create modal for leaderboard
                const leaderboardModal = document.createElement('div');
                leaderboardModal.id = 'leaderboard-modal';
                leaderboardModal.className = 'modal';
                document.body.appendChild(leaderboardModal);
                
                leaderboardModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Top Learners</h2>
                        <div id="leaderboard-list"></div>
                    </div>
                `;
                
                // Close button functionality
                leaderboardModal.querySelector('.close').addEventListener('click', () => {
                    leaderboardModal.classList.remove('show');
                });
            }
            
            // Populate leaderboard
            const leaderboardList = document.getElementById('leaderboard-list');
            leaderboardList.innerHTML = '';
            
            response.forEach((user, index) => {
                const listItem = document.createElement('div');
                listItem.className = 'leaderboard-item';
                listItem.innerHTML = `
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-user">${user.user ? user.user.name : 'Unknown User'}</div>
                    <div class="leaderboard-points">${user.points} pts</div>
                    <div class="leaderboard-level">Level ${user.level}</div>
                `;
                leaderboardList.appendChild(listItem);
            });
            
        } catch (error) {
            console.error('Error setting up leaderboard:', error);
        }
    },
    
    // Initialize quiz functionality
    initQuizzes: function() {
        // Add event listener for lesson completion to show quiz
        document.addEventListener('lessonViewed', async (e) => {
            const lessonId = e.detail.lessonId;
            if (lessonId) {
                try {
                    // Check if there's a quiz for this lesson
                    const quizzes = await fetchFromAPI(`/quizzes?lesson=${lessonId}`);
                    if (quizzes && quizzes.length > 0) {
                        // Show quiz button
                        this.showQuizButton(quizzes[0], lessonId);
                    }
                } catch (error) {
                    console.error('Error checking for quizzes:', error);
                }
            }
        });
    },
    
    // Show quiz button after lesson
    showQuizButton: function(quiz, lessonId) {
        const lessonContainer = document.querySelector('.lesson-content');
        if (!lessonContainer) return;
        
        // Create quiz button if it doesn't exist
        if (!document.getElementById('take-quiz-btn')) {
            const quizButton = document.createElement('button');
            quizButton.id = 'take-quiz-btn';
            quizButton.className = 'btn btn-primary quiz-button';
            quizButton.textContent = 'Take Quiz & Earn Points';
            quizButton.dataset.quizId = quiz._id;
            quizButton.dataset.lessonId = lessonId;
            
            quizButton.addEventListener('click', () => {
                this.loadQuiz(quiz._id);
            });
            
            lessonContainer.appendChild(quizButton);
        }
    },
    
    // Load and display quiz
    loadQuiz: async function(quizId) {
        try {
            const quiz = await fetchFromAPI(`/quizzes/${quizId}`);
            if (!quiz) return;
            
            // Create quiz container
            const quizContainer = document.createElement('div');
            quizContainer.id = 'quiz-container';
            quizContainer.className = 'quiz-container';
            
            // Build quiz HTML
            let quizHTML = `
                <div class="quiz-header">
                    <h2>${quiz.title}</h2>
                    <p>${quiz.description}</p>
                    <div class="quiz-meta">
                        <span class="quiz-difficulty">${quiz.difficulty}</span>
                        <span class="quiz-points">Earn up to ${quiz.pointsToEarn} points</span>
                        <span class="quiz-time">Time: ${Math.floor(quiz.timeLimit / 60)}:${(quiz.timeLimit % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>
                <form id="quiz-form">
            `;
            
            // Add questions
            quiz.questions.forEach((question, qIndex) => {
                quizHTML += `
                    <div class="quiz-question" data-points="${question.points}">
                        <h3>Question ${qIndex + 1}</h3>
                        <p>${question.question}</p>
                        <div class="options-container">
                `;
                
                // Add options
                question.options.forEach((option, oIndex) => {
                    quizHTML += `
                        <div class="option">
                            <input type="radio" id="q${qIndex}_o${oIndex}" name="q${qIndex}" value="${oIndex}">
                            <label for="q${qIndex}_o${oIndex}">${option}</label>
                        </div>
                    `;
                });
                
                quizHTML += `
                        </div>
                    </div>
                `;
            });
            
            // Add submit button
            quizHTML += `
                <div class="quiz-actions">
                    <button type="submit" class="btn btn-primary">Submit Answers</button>
                </div>
                </form>
            `;
            
            // Add to page
            quizContainer.innerHTML = quizHTML;
            document.querySelector('main').appendChild(quizContainer);
            
            // Scroll to quiz
            quizContainer.scrollIntoView({ behavior: 'smooth' });
            
            // Add submit handler
            document.getElementById('quiz-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitQuiz(quiz);
            });
            
            // Start timer if there's a time limit
            if (quiz.timeLimit) {
                this.startQuizTimer(quiz.timeLimit);
            }
            
        } catch (error) {
            console.error('Error loading quiz:', error);
        }
    },
    
    // Start quiz timer
    startQuizTimer: function(timeLimit) {
        let timeRemaining = timeLimit;
        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'quiz-timer';
        timerDisplay.className = 'quiz-timer';
        document.querySelector('.quiz-header').appendChild(timerDisplay);
        
        const updateTimer = () => {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeRemaining <= 10) {
                timerDisplay.classList.add('timer-warning');
            }
            
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                this.submitQuiz(null, true); // Auto-submit when time's up
            }
            
            timeRemaining--;
        };
        
        updateTimer(); // Initial display
        const timerInterval = setInterval(updateTimer, 1000);
    },
    
    // Submit quiz answers
    submitQuiz: async function(quiz, timeUp = false) {
        if (timeUp) {
            alert('Time\'s up! Your answers have been submitted.');
        }
        
        const form = document.getElementById('quiz-form');
        const answers = [];
        
        // Collect answers
        quiz.questions.forEach((_, qIndex) => {
            const selectedOption = form.querySelector(`input[name="q${qIndex}"]:checked`);
            answers.push(selectedOption ? parseInt(selectedOption.value) : -1);
        });
        
        try {
            // Submit to API
            const result = await fetchFromAPI(`/quizzes/${quiz._id}/submit`, {
                method: 'POST',
                body: JSON.stringify({ answers })
            });
            
            // Show results
            this.showQuizResults(quiz, answers, result);
            
            // Update user progress display
            await this.loadUserProgress();
            this.renderUserProgress();
            
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    },
    
    // Show quiz results
    showQuizResults: function(quiz, userAnswers, result) {
        const quizContainer = document.getElementById('quiz-container');
        if (!quizContainer) return;
        
        // Create results container
        const resultsHTML = `
            <div class="quiz-results">
                <h2>Quiz Results</h2>
                <div class="results-summary">
                    <div class="result-stat">
                        <span class="result-value">${result.score}</span>
                        <span class="result-label">Points Earned</span>
                    </div>
                    <div class="result-stat">
                        <span class="result-value">${result.percentage.toFixed(0)}%</span>
                        <span class="result-label">Score</span>
                    </div>
                </div>
                
                <div class="level-progress">
                    <h3>Your Progress</h3>
                    <div class="progress-stats">
                        <div class="stat">
                            <span class="stat-value">${result.userProgress.level}</span>
                            <span class="stat-label">Level</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${result.userProgress.points}</span>
                            <span class="stat-label">Total Points</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${result.userProgress.streak}</span>
                            <span class="stat-label">Day Streak</span>
                        </div>
                    </div>
                </div>
                
                <button id="continue-btn" class="btn btn-primary">Continue Learning</button>
            </div>
        `;
        
        quizContainer.innerHTML = resultsHTML;
        
        // Add continue button handler
        document.getElementById('continue-btn').addEventListener('click', () => {
            quizContainer.remove();
        });
    }
};

// Initialize gamification when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    gamification.init();
});