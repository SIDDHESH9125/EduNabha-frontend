// Progress visualization for EduNabha gamification
const progressVisualization = {
    // Initialize progress visualization
    init: function() {
        if (localStorage.getItem('token')) {
            try {
                this.fetchUserProgress();
                this.setupEventListeners();
            } catch (error) {
                console.error('Error initializing progress visualization:', error);
            }
        }
    },
    
    // Create progress dashboard
    createProgressDashboard: function() {
        // Create dashboard button in sidebar
        const sidebar = document.querySelector('.sidebar-nav');
        if (sidebar && !document.getElementById('progress-dashboard-btn')) {
            const dashboardBtn = document.createElement('button');
            dashboardBtn.id = 'progress-dashboard-btn';
            dashboardBtn.className = 'sidebar-item';
            dashboardBtn.innerHTML = '<i class="fas fa-chart-line"></i> My Progress';
            dashboardBtn.addEventListener('click', () => {
                this.showProgressDashboard();
            });
            sidebar.appendChild(dashboardBtn);
        }
    },
    
    // Show progress dashboard
    showProgressDashboard: async function() {
        try {
            // Get user progress data
            let userProgress;
            try {
                userProgress = await fetchFromAPI('/progress/gamification');
            } catch (error) {
                console.error('Error fetching progress:', error);
                // Use mock data for offline demo
                userProgress = {
                    points: 120,
                    level: 2,
                    streakDays: 3,
                    badges: [
                        { name: "First Lesson", description: "Completed your first lesson", imageUrl: "images/badge-first-lesson.svg" },
                        { name: "Quiz Master", description: "Scored 100% on a quiz", imageUrl: "images/badge-quiz.svg" }
                    ],
                    completedLessons: [{ title: "Introduction to Math" }, { title: "Basic Science" }],
                    completedQuizzes: [{ title: "Math Quiz" }]
                };
            }
            
            // Create modal for dashboard
            let dashboardModal = document.getElementById('progress-dashboard-modal');
            if (!dashboardModal) {
                dashboardModal = document.createElement('div');
                dashboardModal.id = 'progress-dashboard-modal';
                dashboardModal.className = 'modal';
                document.body.appendChild(dashboardModal);
            }
            
            // Generate dashboard content
            dashboardModal.innerHTML = `
                <div class="modal-content dashboard-content">
                    <span class="close">&times;</span>
                    <h2>My Learning Journey</h2>
                    
                    <div class="dashboard-summary">
                        <div class="progress-card">
                            <div class="progress-stats">
                                <div class="stat">
                                    <span class="stat-value">${userProgress.level}</span>
                                    <span class="stat-label">Level</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value">${userProgress.points}</span>
                                    <span class="stat-label">Points</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value">${userProgress.streakDays}</span>
                                    <span class="stat-label">Day Streak</span>
                                </div>
                            </div>
                            
                            <div class="level-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${this.calculateLevelProgress(userProgress)}%"></div>
                                </div>
                                <div class="progress-text">${this.calculateLevelProgress(userProgress)}% to Level ${userProgress.level + 1}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-badges">
                        <h3>My Badges</h3>
                        <div class="badges-grid">
                            ${this.renderBadges(userProgress)}
                        </div>
                    </div>
                    
                    <div class="dashboard-achievements">
                        <h3>My Achievements</h3>
                        <div class="achievements-list">
                            <div class="achievement-section">
                                <h4>Completed Lessons (${userProgress.completedLessons ? userProgress.completedLessons.length : 0})</h4>
                                <ul>
                                    ${this.renderCompletedItems(userProgress.completedLessons)}
                                </ul>
                            </div>
                            <div class="achievement-section">
                                <h4>Completed Quizzes (${userProgress.completedQuizzes ? userProgress.completedQuizzes.length : 0})</h4>
                                <ul>
                                    ${this.renderCompletedItems(userProgress.completedQuizzes)}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="learning-path">
                        <h3>My Learning Path</h3>
                        <div class="path-visualization">
                            ${this.renderLearningPath(userProgress)}
                        </div>
                    </div>
                </div>
            `;
            
            // Show modal
            dashboardModal.classList.add('show');
            
            // Close button functionality
            dashboardModal.querySelector('.close').addEventListener('click', () => {
                dashboardModal.classList.remove('show');
            });
            
        } catch (error) {
            console.error('Error showing progress dashboard:', error);
        }
    },
    
    // Calculate progress to next level (100 points per level)
    calculateLevelProgress: function(userProgress) {
        if (!userProgress) return 0;
        const pointsInCurrentLevel = userProgress.points % 100;
        return Math.floor((pointsInCurrentLevel / 100) * 100);
    },
    
    // Render badges
    renderBadges: function(userProgress) {
        if (!userProgress || !userProgress.badges || userProgress.badges.length === 0) {
            return '<p class="empty-message">Complete activities to earn badges!</p>';
        }
        
        let badgesHTML = '';
        
        userProgress.badges.forEach(badge => {
            badgesHTML += `
                <div class="badge-item" title="${badge.description}">
                    <img src="${badge.imageUrl}" alt="${badge.name}" class="badge-icon">
                    <span class="badge-name">${badge.name}</span>
                </div>
            `;
        });
        
        return badgesHTML;
    },
    
    // Render completed items (lessons or quizzes)
    renderCompletedItems: function(items) {
        if (!items || items.length === 0) {
            return '<li class="empty-message">No items completed yet</li>';
        }
        
        let itemsHTML = '';
        
        items.forEach(item => {
            itemsHTML += `<li>${item.title}</li>`;
        });
        
        return itemsHTML;
    },
    
    // Render learning path visualization
    renderLearningPath: function(userProgress) {
        // Create a simple path visualization
        const totalLessons = lessons.length;
        const completedCount = userProgress.completedLessons ? userProgress.completedLessons.length : 0;
        const completionPercentage = totalLessons > 0 ? Math.floor((completedCount / totalLessons) * 100) : 0;
        
        return `
            <div class="path-progress">
                <div class="path-label">Overall Curriculum Progress</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionPercentage}%"></div>
                </div>
                <div class="progress-text">${completionPercentage}% Complete (${completedCount}/${totalLessons} lessons)</div>
            </div>
            <div class="next-steps">
                <h4>Recommended Next Steps</h4>
                <ul>
                    ${this.getRecommendedLessons(userProgress)}
                </ul>
            </div>
        `;
    },
    
    // Get recommended lessons based on user progress
    getRecommendedLessons: function(userProgress) {
        const completedLessonIds = userProgress.completedLessons 
            ? userProgress.completedLessons.map(lesson => lesson._id)
            : [];
        
        // Find lessons not yet completed
        const incompleteLessons = lessons.filter(lesson => 
            !completedLessonIds.includes(lesson.id)
        );
        
        // Get up to 3 recommended lessons
        const recommendedLessons = incompleteLessons.slice(0, 3);
        
        if (recommendedLessons.length === 0) {
            return '<li class="empty-message">You\'ve completed all available lessons!</li>';
        }
        
        let recommendationsHTML = '';
        
        recommendedLessons.forEach(lesson => {
            recommendationsHTML += `
                <li>
                    <a href="#" class="recommended-lesson" data-id="${lesson.id}">
                        ${lesson.title}
                    </a>
                </li>
            `;
        });
        
        return recommendationsHTML;
    }
};

// Initialize progress visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    progressVisualization.init();
});