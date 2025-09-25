// Offline functionality for EduNabha
document.addEventListener('DOMContentLoaded', function() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error);
            });
    }

    // Load offline data
    loadOfflineData();
    
    // Update online status
    updateOnlineStatus();
});

// Offline status indicator
function updateOnlineStatus() {
    const indicator = document.querySelector('.offline-indicator');
    
    // Create indicator if it doesn't exist
    if (!indicator) {
        const newIndicator = document.createElement('div');
        newIndicator.className = 'offline-indicator';
        document.body.appendChild(newIndicator);
    }
    
    const statusIndicator = document.querySelector('.offline-indicator');
    
    if (navigator.onLine) {
        statusIndicator.textContent = 'You are online';
        statusIndicator.style.backgroundColor = '#34a853'; // Green
        
        // Hide after 3 seconds when online
        setTimeout(() => {
            statusIndicator.style.display = 'none';
        }, 3000);
    } else {
        statusIndicator.textContent = 'You are offline - App still works!';
        statusIndicator.style.backgroundColor = '#fbbc05'; // Yellow
        statusIndicator.style.display = 'block';
    }
}

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Load data from local storage or sample data
function loadOfflineData() {
    // Check if we have lessons in localStorage
    let lessons = JSON.parse(localStorage.getItem('lessons'));
    
    // If no lessons in localStorage, use sample data
    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
        fetch('data/sample-lessons.js')
            .then(response => response.text())
            .then(text => {
                // Extract the array from the JS file
                const startIndex = text.indexOf('[');
                const endIndex = text.lastIndexOf(']') + 1;
                const arrayText = text.substring(startIndex, endIndex);
                
                // Parse the array and store in localStorage
                lessons = JSON.parse(arrayText);
                localStorage.setItem('lessons', JSON.stringify(lessons));
            })
            .catch(error => {
                console.error('Error loading sample lessons:', error);
            });
    }
    
    // Check if we have resources in localStorage
    let resources = JSON.parse(localStorage.getItem('resources'));
    
    // If no resources in localStorage, use sample data
    if (!resources || !Array.isArray(resources) || resources.length === 0) {
        fetch('data/sample-resources.js')
            .then(response => response.text())
            .then(text => {
                // Extract the array from the JS file
                const startIndex = text.indexOf('[');
                const endIndex = text.lastIndexOf(']') + 1;
                const arrayText = text.substring(startIndex, endIndex);
                
                // Parse the array and store in localStorage
                resources = JSON.parse(arrayText);
                localStorage.setItem('resources', JSON.stringify(resources));
            })
            .catch(error => {
                console.error('Error loading sample resources:', error);
            });
    }
    
    // Check if we have quizzes in localStorage
    let quizzes = JSON.parse(localStorage.getItem('quizzes'));
    
    // If no quizzes in localStorage, use sample data
    if (!quizzes || !Array.isArray(quizzes) || quizzes.length === 0) {
        fetch('data/sample-quizzes.js')
            .then(response => response.text())
            .then(text => {
                // Extract the array from the JS file
                const startIndex = text.indexOf('[');
                const endIndex = text.lastIndexOf(']') + 1;
                const arrayText = text.substring(startIndex, endIndex);
                
                // Parse the array and store in localStorage
                quizzes = JSON.parse(arrayText);
                localStorage.setItem('quizzes', JSON.stringify(quizzes));
            })
            .catch(error => {
                console.error('Error loading sample quizzes:', error);
            });
    }
}

// IndexedDB setup for offline data storage
const dbName = 'eduNabhaDB';
const dbVersion = 1;
let db;

const request = indexedDB.open(dbName, dbVersion);

request.onerror = function(event) {
    console.error('IndexedDB error:', event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('IndexedDB connected successfully');
};

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    
    // Create object stores
    const lessonsStore = db.createObjectStore('lessons', { keyPath: 'id' });
    const resourcesStore = db.createObjectStore('resources', { keyPath: 'id' });
    const userProgressStore = db.createObjectStore('userProgress', { keyPath: 'lessonId' });
    const quizzesStore = db.createObjectStore('quizzes', { keyPath: 'id' });
    
    console.log('IndexedDB setup complete');
};

// Function to download lesson for offline use
function downloadLessonForOffline(lessonId) {
    // In a real app, this would download all lesson content and resources
    console.log(`Downloading lesson ${lessonId} for offline use`);
    
    // For demo purposes, we'll just show an alert
    alert(`Lesson ${lessonId} has been downloaded for offline use.`);
    
    // Update UI to show downloaded status
    const lessonCard = document.querySelector(`.lesson-card[data-id="${lessonId}"]`);
    if (lessonCard) {
        const downloadBtn = lessonCard.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.textContent = 'Downloaded';
            downloadBtn.disabled = true;
        }
    }
}

// Save lessons to IndexedDB for offline use
function saveLessonsOffline(lessons) {
    if (lessons && Array.isArray(lessons)) {
        lessons.forEach(lesson => {
            // Save lesson data to IndexedDB
            const lessonRequest = db.transaction(['lessons'], 'readwrite')
                .objectStore('lessons')
                .put(lesson);
            
            lessonRequest.onsuccess = function() {
                console.log('Lesson saved offline:', lesson.title);
            };
            
            lessonRequest.onerror = function() {
                console.error('Error saving lesson offline:', lesson.title);
            };
        });
    } else {
        console.error('Lessons is not an array:', lessons);
    }
}

// Save resources to IndexedDB for offline use
function saveResourcesOffline(resources) {
    if (resources && Array.isArray(resources)) {
        resources.forEach(resource => {
            // Save resource data to IndexedDB
            const resourceRequest = db.transaction(['resources'], 'readwrite')
                .objectStore('resources')
                .put(resource);
            
            resourceRequest.onsuccess = function() {
                console.log('Resource saved offline:', resource.title);
            };
            
            resourceRequest.onerror = function() {
                console.error('Error saving resource offline:', resource.title);
            };
        });
    } else {
        console.error('Resources is not an array:', resources);
    }
}