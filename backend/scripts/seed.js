/**
 * Database Seeding Script
 * Implements: Sample data creation for testing and demonstration
 * Creates users, courses with modules, and sample progress data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Event = require('../models/Event');
const Progress = require('../models/Progress');

// Sample data
const sampleCourses = [
  {
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript',
    modules: [
      {
        title: 'HTML Basics',
        description: 'Introduction to HTML structure and elements',
        order: 1,
        contents: [
          {
            type: 'video',
            title: 'HTML Introduction Video',
            duration: 600, // 10 minutes
          },
          {
            type: 'reading',
            title: 'HTML Elements and Tags',
            content: `
              <h2>HTML Elements</h2>
              <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages.</p>
              <h3>Basic Structure</h3>
              <p>Every HTML document starts with a DOCTYPE declaration and contains html, head, and body elements.</p>
              <h3>Common Elements</h3>
              <ul>
                <li>&lt;h1&gt; to &lt;h6&gt; - Headings</li>
                <li>&lt;p&gt; - Paragraphs</li>
                <li>&lt;a&gt; - Links</li>
                <li>&lt;img&gt; - Images</li>
                <li>&lt;div&gt; - Division/Container</li>
              </ul>
              <h3>Attributes</h3>
              <p>HTML elements can have attributes that provide additional information. For example, the &lt;a&gt; tag uses the href attribute to specify the link destination.</p>
              <h3>Best Practices</h3>
              <p>Always use semantic HTML elements, keep your code clean and well-indented, and validate your HTML code.</p>
            `
          },
          {
            type: 'quiz',
            title: 'HTML Basics Quiz',
            questions: [
              {
                question: 'What does HTML stand for?',
                options: ['HyperText Markup Language', 'HighText Markup Language', 'HyperText Markdown Language', 'HyperText Makeup Language'],
                correctAnswer: 0
              },
              {
                question: 'Which tag is used for the largest heading?',
                options: ['<h6>', '<h1>', '<heading>', '<head>'],
                correctAnswer: 1
              },
              {
                question: 'What is the correct HTML element for inserting a line break?',
                options: ['<break>', '<br>', '<lb>', '<linebreak>'],
                correctAnswer: 1
              }
            ]
          }
        ]
      },
      {
        title: 'CSS Styling',
        description: 'Learn how to style your web pages with CSS',
        order: 2,
        contents: [
          {
            type: 'video',
            title: 'CSS Fundamentals',
            duration: 720, // 12 minutes
          },
          {
            type: 'reading',
            title: 'CSS Selectors and Properties',
            content: `
              <h2>CSS Basics</h2>
              <p>CSS (Cascading Style Sheets) is used to style and layout web pages.</p>
              <h3>Selectors</h3>
              <p>CSS selectors are used to target HTML elements. Common selectors include:</p>
              <ul>
                <li>Element selector: p { }</li>
                <li>Class selector: .classname { }</li>
                <li>ID selector: #idname { }</li>
                <li>Descendant selector: div p { }</li>
              </ul>
              <h3>Properties</h3>
              <p>CSS properties control the appearance of elements. Some common properties include:</p>
              <ul>
                <li>color - text color</li>
                <li>background-color - background color</li>
                <li>font-size - text size</li>
                <li>margin - outer spacing</li>
                <li>padding - inner spacing</li>
                <li>border - border styling</li>
              </ul>
              <h3>Box Model</h3>
              <p>The CSS box model consists of content, padding, border, and margin. Understanding the box model is crucial for layout design.</p>
            `
          },
          {
            type: 'quiz',
            title: 'CSS Quiz',
            questions: [
              {
                question: 'What does CSS stand for?',
                options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
                correctAnswer: 1
              },
              {
                question: 'Which property is used to change the text color?',
                options: ['text-color', 'font-color', 'color', 'text-style'],
                correctAnswer: 2
              }
            ]
          }
        ]
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Introduction to JavaScript programming',
        order: 3,
        contents: [
          {
            type: 'video',
            title: 'JavaScript Basics',
            duration: 900, // 15 minutes
          },
          {
            type: 'reading',
            title: 'JavaScript Variables and Functions',
            content: `
              <h2>JavaScript Basics</h2>
              <p>JavaScript is a programming language that adds interactivity to web pages.</p>
              <h3>Variables</h3>
              <p>Variables are used to store data. In modern JavaScript, you can declare variables using:</p>
              <ul>
                <li>let - for variables that can be reassigned</li>
                <li>const - for constants that cannot be reassigned</li>
                <li>var - older way (not recommended)</li>
              </ul>
              <h3>Functions</h3>
              <p>Functions are reusable blocks of code. They can be declared using:</p>
              <ul>
                <li>Function declarations: function name() { }</li>
                <li>Arrow functions: const name = () => { }</li>
              </ul>
              <h3>Data Types</h3>
              <p>JavaScript has several data types including strings, numbers, booleans, arrays, and objects.</p>
            `
          },
          {
            type: 'quiz',
            title: 'JavaScript Quiz',
            questions: [
              {
                question: 'Which keyword is used to declare a constant in JavaScript?',
                options: ['var', 'let', 'const', 'constant'],
                correctAnswer: 2
              },
              {
                question: 'What is the correct way to write an array in JavaScript?',
                options: ['array = (1,2,3)', 'array = [1,2,3]', 'array = {1,2,3}', 'array = <1,2,3>'],
                correctAnswer: 1
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'React Development Course',
    description: 'Master React.js for building modern web applications',
    modules: [
      {
        title: 'React Components',
        description: 'Understanding React components and JSX',
        order: 1,
        contents: [
          {
            type: 'video',
            title: 'Introduction to React',
            duration: 840, // 14 minutes
          },
          {
            type: 'reading',
            title: 'React Components and Props',
            content: `
              <h2>React Components</h2>
              <p>React is a JavaScript library for building user interfaces.</p>
              <h3>Components</h3>
              <p>Components are the building blocks of React applications. They can be:</p>
              <ul>
                <li>Function components - simple functions that return JSX</li>
                <li>Class components - ES6 classes that extend React.Component</li>
              </ul>
              <h3>JSX</h3>
              <p>JSX is a syntax extension that looks like HTML but is actually JavaScript. It allows you to write HTML-like code in your JavaScript files.</p>
              <h3>Props</h3>
              <p>Props (properties) are used to pass data from parent components to child components. Props are read-only and should not be modified.</p>
            `
          },
          {
            type: 'quiz',
            title: 'React Basics Quiz',
            questions: [
              {
                question: 'What is JSX?',
                options: ['A programming language', 'A syntax extension for JavaScript', 'A CSS framework', 'A database'],
                correctAnswer: 1
              },
              {
                question: 'Can props be modified in a component?',
                options: ['Yes', 'No', 'Sometimes', 'Only in class components'],
                correctAnswer: 1
              }
            ]
          }
        ]
      },
      {
        title: 'State and Hooks',
        description: 'Managing component state with React Hooks',
        order: 2,
        contents: [
          {
            type: 'video',
            title: 'React Hooks Explained',
            duration: 960, // 16 minutes
          },
          {
            type: 'reading',
            title: 'useState and useEffect Hooks',
            content: `
              <h2>React Hooks</h2>
              <p>Hooks are functions that let you "hook into" React features from function components.</p>
              <h3>useState Hook</h3>
              <p>The useState hook allows you to add state to functional components. It returns an array with two elements: the current state value and a function to update it.</p>
              <h3>useEffect Hook</h3>
              <p>The useEffect hook lets you perform side effects in functional components. It's similar to componentDidMount, componentDidUpdate, and componentWillUnmount combined.</p>
              <h3>Other Hooks</h3>
              <p>React provides many other hooks like useContext, useReducer, useMemo, and useCallback for different use cases.</p>
            `
          },
          {
            type: 'quiz',
            title: 'React Hooks Quiz',
            questions: [
              {
                question: 'Which hook is used to manage state in functional components?',
                options: ['useState', 'useEffect', 'useContext', 'useReducer'],
                correctAnswer: 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'Node.js Backend Development',
    description: 'Build server-side applications with Node.js and Express',
    modules: [
      {
        title: 'Node.js Basics',
        description: 'Introduction to Node.js runtime environment',
        order: 1,
        contents: [
          {
            type: 'video',
            title: 'Node.js Introduction',
            duration: 780, // 13 minutes
          },
          {
            type: 'reading',
            title: 'Node.js Modules and NPM',
            content: `
              <h2>Node.js Basics</h2>
              <p>Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.</p>
              <h3>Modules</h3>
              <p>Node.js uses a module system based on CommonJS. You can use require() to import modules and module.exports to export them.</p>
              <h3>NPM</h3>
              <p>NPM (Node Package Manager) is the default package manager for Node.js. It allows you to install and manage dependencies for your projects.</p>
              <h3>Express.js</h3>
              <p>Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.</p>
            `
          },
          {
            type: 'quiz',
            title: 'Node.js Quiz',
            questions: [
              {
                question: 'What is Node.js?',
                options: ['A database', 'A JavaScript runtime', 'A CSS framework', 'A text editor'],
                correctAnswer: 1
              },
              {
                question: 'What does NPM stand for?',
                options: ['Node Package Manager', 'Node Program Manager', 'Node Project Manager', 'Node Process Manager'],
                correctAnswer: 0
              }
            ]
          }
        ]
      },
      {
        title: 'Express.js Framework',
        description: 'Building RESTful APIs with Express',
        order: 2,
        contents: [
          {
            type: 'video',
            title: 'Express.js Tutorial',
            duration: 1020, // 17 minutes
          },
          {
            type: 'reading',
            title: 'Express Routes and Middleware',
            content: `
              <h2>Express.js Framework</h2>
              <p>Express is a fast, unopinionated, minimalist web framework for Node.js.</p>
              <h3>Routes</h3>
              <p>Routes define how your application responds to client requests. You can define routes for different HTTP methods (GET, POST, PUT, DELETE).</p>
              <h3>Middleware</h3>
              <p>Middleware functions have access to the request object, response object, and the next middleware function. They can execute code, make changes to the request/response, and call the next middleware.</p>
              <h3>RESTful APIs</h3>
              <p>REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs use standard HTTP methods and status codes.</p>
            `
          },
          {
            type: 'quiz',
            title: 'Express.js Quiz',
            questions: [
              {
                question: 'What is Express.js?',
                options: ['A database', 'A web framework for Node.js', 'A CSS framework', 'A JavaScript library'],
                correctAnswer: 1
              }
            ]
          }
        ]
      }
    ]
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-progress';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Event.deleteMany({});
    await Progress.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create instructor
    console.log('👨‍🏫 Creating instructor...');
    const instructor = new User({
      name: 'Dr. John Smith',
      email: 'instructor@example.com',
      password: 'instructor123',
      role: 'instructor'
    });
    await instructor.save();
    console.log('✅ Instructor created:', instructor.email);

    // Create students
    console.log('👨‍🎓 Creating students...');
    const students = [];
    const studentData = [
      { name: 'Alice Johnson', email: 'alice@example.com' },
      { name: 'Bob Williams', email: 'bob@example.com' },
      { name: 'Charlie Brown', email: 'charlie@example.com' }
    ];

    for (const studentInfo of studentData) {
      const student = new User({
        name: studentInfo.name,
        email: studentInfo.email,
        password: 'student123',
        role: 'student'
      });
      await student.save();
      students.push(student);
      console.log('✅ Student created:', student.email);
    }

    // Create courses
    console.log('📚 Creating courses...');
    const courses = [];
    for (const courseData of sampleCourses) {
      const course = new Course({
        title: courseData.title,
        description: courseData.description,
        instructor: instructor._id,
        modules: courseData.modules
      });
      await course.save();
      courses.push(course);
      console.log('✅ Course created:', course.title);
    }

    // Create some sample events and progress for first student and first course
    if (students.length > 0 && courses.length > 0) {
      console.log('📊 Creating sample progress data...');
      const student = students[0];
      const course = courses[0];

      // Create events for first module
      if (course.modules.length > 0) {
        const module = course.modules[0];
        
        // Video watch event (85% - In Progress)
        if (module.contents.find(c => c.type === 'video')) {
          const videoContent = module.contents.find(c => c.type === 'video');
          const videoEvent = new Event({
            userId: student._id,
            courseId: course._id,
            moduleId: module._id.toString(),
            contentType: 'video',
            contentId: videoContent._id.toString(),
            eventType: 'watch',
            percentage: 85,
            timeSpent: 510, // 8.5 minutes
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          });
          await videoEvent.save();
        }

        // Reading scroll event (75% - In Progress)
        if (module.contents.find(c => c.type === 'reading')) {
          const readingContent = module.contents.find(c => c.type === 'reading');
          const readingEvent = new Event({
            userId: student._id,
            courseId: course._id,
            moduleId: module._id.toString(),
            contentType: 'reading',
            contentId: readingContent._id.toString(),
            eventType: 'scroll',
            percentage: 75,
            timeSpent: 300, // 5 minutes
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
          });
          await readingEvent.save();
        }

        // Quiz submission event (Completed)
        if (module.contents.find(c => c.type === 'quiz')) {
          const quizContent = module.contents.find(c => c.type === 'quiz');
          const quizEvent = new Event({
            userId: student._id,
            courseId: course._id,
            moduleId: module._id.toString(),
            contentType: 'quiz',
            contentId: quizContent._id.toString(),
            eventType: 'submit',
            percentage: 100,
            timeSpent: 600, // 10 minutes
            timestamp: new Date()
          });
          await quizEvent.save();
        }
      }

      // Trigger progress calculation
      const { updateProgress } = require('../services/progressCalculator');
      await updateProgress(student._id, course._id);
      console.log('✅ Sample progress data created');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Instructor:');
    console.log('  Email: instructor@example.com');
    console.log('  Password: instructor123');
    console.log('\nStudents:');
    console.log('  Email: alice@example.com (or bob@example.com, charlie@example.com)');
    console.log('  Password: student123');
    console.log('\n✅ You can now login and see courses in the dashboards!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();

