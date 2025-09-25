// EduNabha - Main Application JavaScript

// DOM Elements
const app = document.getElementById('app');
const navLinks = document.querySelectorAll('nav a');
const pages = document.querySelectorAll('.page');
const languageSelector = document.getElementById('language');
const startLearningBtn = document.querySelector('.cta-button');
const subjectFilter = document.getElementById('subject-filter');
const gradeFilter = document.getElementById('grade-filter');
const loginForm = document.getElementById('login-form');
const lessonsGrid = document.querySelector('.lessons-grid');
const resourcesGrid = document.querySelector('.resources-grid');

// API URL
const API_URL = 'https://edunabha-backend-api.vercel.app/api';

// Sample data - Will be fetched from API in production
let lessons = [
    {
        id: 1,
        title: 'Introduction to Computers',
        subject: 'computer',
        grade: '6-8',
        description: 'Learn the basics of computers and how they work.',
        thumbnail: 'images/lesson-computer-intro.svg',
        language: ['en', 'pa', 'hi'],
        duration: '30 min'
    },
    {
        id: 2,
        title: 'Internet Safety',
        subject: 'computer',
        grade: '6-8',
        description: 'Learn how to stay safe online and protect your information.',
        thumbnail: 'images/lesson-internet-safety.svg',
        language: ['en', 'pa', 'hi'],
        duration: '25 min'
    },
    {
        id: 3,
        title: 'Basic Mathematics',
        subject: 'math',
        grade: '1-5',
        description: 'Learn addition, subtraction, multiplication, and division.',
        thumbnail: 'images/lesson-math-basic.svg',
        language: ['en', 'pa', 'hi'],
        duration: '45 min'
    },
    {
        id: 4,
        title: 'Science Experiments',
        subject: 'science',
        grade: '6-8',
        description: 'Simple science experiments you can do at home.',
        thumbnail: 'images/lesson-science-experiments.svg',
        language: ['en', 'pa', 'hi'],
        duration: '40 min'
    },
    {
        id: 5,
        title: 'Reading and Writing',
        subject: 'language',
        grade: '1-5',
        description: 'Improve your reading and writing skills.',
        thumbnail: 'images/lesson-language-reading.svg',
        language: ['en', 'pa', 'hi'],
        duration: '35 min'
    },
    {
        id: 6,
        title: 'Advanced Computer Skills',
        subject: 'computer',
        grade: '9-12',
        description: 'Learn advanced computer skills for high school students.',
        thumbnail: 'images/lesson-computer-advanced.svg',
        language: ['en', 'pa', 'hi'],
        duration: '50 min'
    }
];

let resources = [
    {
        id: 1,
        title: 'Digital Literacy Basics',
        category: 'literacy',
        description: 'Learn the fundamentals of using digital devices.',
        thumbnail: 'images/resource-digital-literacy.svg'
    },
    {
        id: 2,
        title: 'Internet Research Skills',
        category: 'research',
        description: 'How to effectively search and find information online.',
        thumbnail: 'images/resource-research.svg'
    },
    {
        id: 3,
        title: 'Digital Safety Guide',
        category: 'safety',
        description: 'Comprehensive guide to staying safe in the digital world.',
        thumbnail: 'images/resource-safety.svg'
    },
    {
        id: 4,
        title: 'Educational Apps Guide',
        category: 'apps',
        description: 'Curated list of educational apps for students.',
        thumbnail: 'images/resource-apps.svg'
    }
];

// Function to fetch data from API
async function fetchFromAPI(endpoint) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token || ''
            }
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            console.error(`Error fetching from ${endpoint}:`, response.statusText);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        return null;
    }
}

// Initialize the application
async function initApp() {
    // Set up navigation
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');
                changePage(targetPage);
            });
        });
    }

    // Language selector
    if (languageSelector) {
        languageSelector.addEventListener('change', changeLanguage);
    }

    // Start Learning button
    startLearningBtn.addEventListener('click', () => {
        changePage('lessons');
    });

    // Lesson filters
    subjectFilter.addEventListener('change', filterLessons);
    gradeFilter.addEventListener('change', filterLessons);

    // Login form
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real app, this would validate credentials
        document.querySelector('.login-required').classList.add('hidden');
        document.querySelector('.dashboard-content').classList.remove('hidden');
        loadDashboard();
    });

    // Try to fetch data from API
    try {
        const apiLessons = await fetchFromAPI('lessons');
        if (apiLessons) lessons = apiLessons;
        
        const apiResources = await fetchFromAPI('resources');
        if (apiResources) resources = apiResources;
        
        const apiQuizzes = await fetchFromAPI('quizzes');
        if (apiQuizzes) window.quizzes = apiQuizzes;
    } catch (error) {
        console.log('Using offline data:', error);
        // Initialize quizzes if not available
        window.quizzes = window.quizzes || [];
    }

    // Load initial content
    loadLessons();
    loadResources();
}

// Change active page
function changePage(pageId) {
    // Update navigation
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update visible page
    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
}

// Change language
function changeLanguage() {
    const selectedLanguage = languageSelector.value;
    // In a real app, this would update all text content based on selected language
    console.log(`Language changed to: ${selectedLanguage}`);
    
    // For demonstration, we'll just update the page title
    const titles = {
        'en': 'EduNabha - Digital Learning for Rural Schools',
        'pa': 'ਐਜੂਨਾਭਾ - ਪੇਂਡੂ ਸਕੂਲਾਂ ਲਈ ਡਿਜੀਟਲ ਸਿੱਖਿਆ',
        'hi': 'एडुनाभा - ग्रामीण स्कूलों के लिए डिजिटल शिक्षा'
    };
    
    document.title = titles[selectedLanguage];
}

// Load lessons
function loadLessons() {
    lessonsGrid.innerHTML = '';
    
    lessons.forEach(lesson => {
        const lessonCard = document.createElement('div');
        lessonCard.className = 'feature-card lesson-card';
        lessonCard.setAttribute('data-subject', lesson.subject);
        lessonCard.setAttribute('data-grade', lesson.grade);
        
        lessonCard.innerHTML = `
            <img src="${lesson.thumbnail}" alt="${lesson.title}">
            <h3>${lesson.title}</h3>
            <p>${lesson.description}</p>
            <div class="lesson-meta">
                <span class="duration">${lesson.duration}</span>
                <span class="grade">Grade: ${lesson.grade}</span>
            </div>
            <button class="cta-button">Start Lesson</button>
        `;
        
        lessonCard.querySelector('button').addEventListener('click', () => {
            openLesson(lesson.id);
        });
        
        lessonsGrid.appendChild(lessonCard);
    });
}

// Filter lessons
function filterLessons() {
    const subject = subjectFilter.value;
    const grade = gradeFilter.value;
    
    const lessonCards = document.querySelectorAll('.lesson-card');
    
    lessonCards.forEach(card => {
        const cardSubject = card.getAttribute('data-subject');
        const cardGrade = card.getAttribute('data-grade');
        
        let showCard = true;
        
        if (subject !== 'all' && cardSubject !== subject) {
            showCard = false;
        }
        
        if (grade !== 'all' && cardGrade !== grade) {
            showCard = false;
        }
        
        if (showCard) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Load resources
function loadResources() {
    resourcesGrid.innerHTML = '';
    
    resources.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'feature-card resource-card';
        
        resourceCard.innerHTML = `
            <img src="${resource.thumbnail}" alt="${resource.title}">
            <h3>${resource.title}</h3>
            <p>${resource.description}</p>
            <button class="cta-button">View Resource</button>
        `;
        
        resourceCard.querySelector('button').addEventListener('click', () => {
            openResource(resource.id);
        });
        
        resourcesGrid.appendChild(resourceCard);
    });
}

// Open a lesson
function openLesson(lessonId) {
    // In a real app, this would open the lesson content
    console.log(`Opening lesson: ${lessonId}`);
    alert(`Lesson ${lessonId} would open here. This would be a full interactive lesson in the real app.`);
    
    // Trigger lesson viewed event for gamification
    const event = new CustomEvent('lessonViewed', {
        detail: { lessonId: lessonId }
    });
    document.dispatchEvent(event);
}

// Open a resource
function openResource(resourceId) {
    // In a real app, this would open the resource content
    console.log(`Opening resource: ${resourceId}`);
    alert(`Resource ${resourceId} would open here. This would be a full resource in the real app.`);
}

// Load dashboard
function loadDashboard() {
    const dashboardContent = document.querySelector('.dashboard-content');
    
    // In a real app, this would load actual student data
    dashboardContent.innerHTML = `
        <div class="dashboard-header">
            <h3>Welcome, Teacher!</h3>
            <p>Here's an overview of your students' progress</p>
        </div>
        
        <div class="dashboard-stats">
            <div class="stat-card">
                <h4>Total Students</h4>
                <p class="stat-number">45</p>
            </div>
            <div class="stat-card">
                <h4>Lessons Completed</h4>
                <p class="stat-number">156</p>
            </div>
            <div class="stat-card">
                <h4>Average Score</h4>
                <p class="stat-number">78%</p>
            </div>
        </div>
        
        <div class="student-progress">
            <h3>Student Progress</h3>
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Grade</th>
                        <th>Lessons Completed</th>
                        <th>Average Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Amit Singh</td>
                        <td>7</td>
                        <td>5</td>
                        <td>85%</td>
                    </tr>
                    <tr>
                        <td>Priya Kaur</td>
                        <td>6</td>
                        <td>4</td>
                        <td>92%</td>
                    </tr>
                    <tr>
                        <td>Rahul Sharma</td>
                        <td>8</td>
                        <td>3</td>
                        <td>76%</td>
                    </tr>
                    <tr>
                        <td>Neha Patel</td>
                        <td>7</td>
                        <td>6</td>
                        <td>88%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
