// Sample quizzes for offline functionality
const sampleQuizzes = [
  {
    id: "quiz1",
    title: "Basic Mathematics Quiz",
    description: "Test your knowledge of basic mathematics concepts",
    lessonId: "lesson1",
    questions: [
      {
        question: "What is 5 + 7?",
        options: ["10", "12", "15", "11"],
        correctAnswer: 1,
        points: 10
      },
      {
        question: "What is 8 × 4?",
        options: ["24", "28", "32", "36"],
        correctAnswer: 2,
        points: 10
      },
      {
        question: "What is 20 ÷ 5?",
        options: ["5", "4", "3", "2"],
        correctAnswer: 0,
        points: 10
      }
    ],
    difficulty: "beginner",
    timeLimit: 120,
    pointsToEarn: 30
  },
  {
    id: "quiz2",
    title: "Science Quiz",
    description: "Test your knowledge of basic science concepts",
    lessonId: "lesson2",
    questions: [
      {
        question: "What is the chemical symbol for water?",
        options: ["O2", "CO2", "H2O", "N2"],
        correctAnswer: 2,
        points: 10
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: 1,
        points: 10
      },
      {
        question: "What is the process by which plants make their food?",
        options: ["Photosynthesis", "Respiration", "Digestion", "Excretion"],
        correctAnswer: 0,
        points: 10
      }
    ],
    difficulty: "beginner",
    timeLimit: 120,
    pointsToEarn: 30
  }
];

// Make available for offline use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = sampleQuizzes;
}