import { useEffect, useMemo, useState } from 'react'
import './App.css'

const careersApiUrl = 'http://localhost:8080/api/careers'
const assessmentsApiUrl = 'http://localhost:8080/api/assessments'
const authApiUrl = 'http://localhost:8080/api/auth'
const projectsApiUrl = 'http://localhost:8080/api/projects'
const companyPreferencesApiUrl = 'http://localhost:8080/api/preferences/companies'
const xpApiUrl = 'http://localhost:8080/api/xp'

const domains = [
  { id: 'ece', label: 'Electronics and Communication Engineering (ECE)', icon: 'design' },
  { id: 'embedded', label: 'Embedded Systems', icon: 'code' },
  { id: 'iot', label: 'Internet of Things (IoT)', icon: 'grid' },
  { id: 'vlsi', label: 'VLSI and Chip Design', icon: 'chart' },
  { id: 'robotics', label: 'Robotics and Automation', icon: 'settings' },
  { id: 'electrical', label: 'Electrical Engineering', icon: 'spark' },
  { id: 'software', label: 'Software and Web Development', icon: 'code' },
  { id: 'ai', label: 'Artificial Intelligence and Machine Learning', icon: 'chart' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: 'settings' },
  { id: 'cloud', label: 'Networking and Cloud Computing', icon: 'grid' },
  { id: 'data', label: 'Data Science and Analytics', icon: 'chart' },
  { id: 'product', label: 'UI/UX Design and Product Management', icon: 'design' },
  { id: 'custom', label: 'Other / Custom Career', icon: 'spark' },
]

const goalOptions = [
  { id: 'projects', label: 'Build practical projects' },
  { id: 'hands-on', label: 'Hands-on hardware and lab work' },
  { id: 'research', label: 'Explore research and new technology' },
  { id: 'design', label: 'Design user-friendly products' },
  { id: 'analysis', label: 'Analyze data and solve problems' },
  { id: 'career-ready', label: 'Prepare for internships and jobs' },
]

const defaultAssessment = {
  domains: [],
  interests: '',
  customInterest: '',
  experience: 'Beginner',
  goals: [],
}

const assessmentIdStorageKey = 'career-roadmap-assessment-id'
const progressStorageKey = 'career-roadmap-completed'

function createCareer({
  id,
  title,
  domains: careerDomains,
  description,
  skills,
  resources,
  project,
  steps,
  icon = 'code',
  color = 'blue',
  goals = ['projects', 'career-ready'],
  interests = [],
  level = 'Beginner',
}) {
  return {
    id,
    title,
    domains: careerDomains,
    description,
    skills,
    resources,
    project,
    icon,
    color,
    goals,
    interests,
    level,
    roadmap: steps.map((title, index) => ({
      id: `${id}-${index + 1}`,
      title,
      category: title,
      duration: `${index + 1} week${index ? 's' : ''}`,
      level: index > 1 ? 'Intermediate' : 'Beginner',
      description: `Learn and practice ${title.toLowerCase()} for a ${id.replaceAll('-', ' ')} career.`,
    })),
  }
}

const careerLibrary = [
  createCareer({
    id: 'embedded-software',
    title: 'Embedded Software Engineer',
    domains: ['ece', 'embedded'],
    description: 'Write reliable software that runs close to the hardware in everyday devices.',
    skills: ['C', 'C++', 'microcontrollers', 'debugging', 'communication protocols'],
    resources: [
      { title: 'Embedded Systems Programming', source: 'Quantum Leaps', url: 'https://www.state-machine.com/quickstart' },
      { title: 'Arduino language reference', source: 'Arduino', url: 'https://docs.arduino.cc/language-reference/' },
    ],
    project: 'Build a sensor monitor on a microcontroller and show live readings on a small display.',
    steps: ['C programming and bitwise basics', 'Microcontroller GPIO and timers', 'Serial protocols and sensors', 'Build and document a sensor device'],
    icon: 'code',
    interests: ['firmware', 'hardware', 'devices', 'microcontroller', 'electronics'],
    goals: ['projects', 'hands-on', 'career-ready'],
  }),
  createCareer({
    id: 'iot-engineer',
    title: 'IoT Developer / IoT Engineer',
    domains: ['ece', 'embedded', 'iot'],
    description: 'Connect physical devices, sensors, and cloud services to solve real-world problems.',
    skills: ['sensors', 'ESP32', 'MQTT', 'Wi-Fi', 'cloud basics'],
    resources: [
      { title: 'ESP32 getting started', source: 'Espressif', url: 'https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/' },
      { title: 'MQTT essentials', source: 'HiveMQ', url: 'https://www.hivemq.com/mqtt-essentials/' },
    ],
    project: 'Create a room environment monitor that sends temperature and humidity readings to a dashboard.',
    steps: ['Electronics and sensor fundamentals', 'Program an ESP32 development board', 'Send device data with MQTT', 'Build a connected sensor prototype'],
    icon: 'grid',
    color: 'green',
    interests: ['iot', 'connected devices', 'sensors', 'smart home', 'wireless'],
    goals: ['projects', 'hands-on', 'career-ready'],
  }),
  createCareer({
    id: 'firmware-engineer',
    title: 'Firmware Engineer',
    domains: ['ece', 'embedded'],
    description: 'Develop low-level firmware that makes electronic products dependable and efficient.',
    skills: ['C', 'interrupts', 'RTOS basics', 'JTAG', 'hardware debugging'],
    resources: [
      { title: 'FreeRTOS documentation', source: 'FreeRTOS', url: 'https://www.freertos.org/Documentation/RTOS_book.html' },
      { title: 'Embedded C tutorials', source: 'Embedded Artistry', url: 'https://embeddedartistry.com/blog/' },
    ],
    project: 'Write interrupt-driven firmware for a button-controlled device with a simple task scheduler.',
    steps: ['C and memory fundamentals', 'GPIO, interrupts, and timers', 'Debug with serial and JTAG tools', 'Build a small RTOS-based device'],
    interests: ['firmware', 'low-level', 'microcontroller', 'device drivers'],
    goals: ['projects', 'hands-on', 'research'],
  }),
  createCareer({
    id: 'electronics-design',
    title: 'Electronics Design Engineer',
    domains: ['ece'],
    description: 'Design and prototype circuits that turn product ideas into working electronic systems.',
    skills: ['circuit analysis', 'analog electronics', 'PCB design', 'SPICE', 'soldering'],
    resources: [
      { title: 'Electronics tutorials', source: 'All About Circuits', url: 'https://www.allaboutcircuits.com/textbook/' },
      { title: 'KiCad getting started', source: 'KiCad', url: 'https://docs.kicad.org/' },
    ],
    project: 'Design a small sensor interface PCB, simulate it, and document its assembly and test steps.',
    steps: ['Circuit theory and components', 'Analog and digital circuit design', 'Schematic capture and PCB layout', 'Fabricate and test a circuit board'],
    icon: 'design',
    color: 'violet',
    interests: ['electronics', 'circuit', 'pcb', 'hardware', 'analog'],
    goals: ['projects', 'hands-on', 'research'],
  }),
  createCareer({
    id: 'hardware-validation',
    title: 'Hardware Testing and Validation Engineer',
    domains: ['ece', 'embedded'],
    description: 'Verify electronic systems with structured tests, lab instruments, and clear engineering reports.',
    skills: ['oscilloscope', 'multimeter', 'test planning', 'Python basics', 'signal analysis'],
    resources: [
      { title: 'Test and measurement basics', source: 'Keysight', url: 'https://www.keysight.com/us/en/learn.html' },
      { title: 'Electronics lab tutorials', source: 'SparkFun', url: 'https://learn.sparkfun.com/' },
    ],
    project: 'Create a repeatable test plan for a sensor board and record voltage, timing, and reliability results.',
    steps: ['Electrical measurement and lab safety', 'Read datasheets and define test cases', 'Capture and analyze device signals', 'Automate a validation report'],
    icon: 'chart',
    color: 'green',
    interests: ['testing', 'validation', 'quality', 'lab', 'hardware'],
    goals: ['hands-on', 'analysis', 'career-ready'],
  }),
  createCareer({
    id: 'vlsi-design',
    title: 'VLSI Design Engineer',
    domains: ['ece', 'vlsi'],
    description: 'Design and verify digital logic that becomes part of modern integrated circuits.',
    skills: ['digital logic', 'Verilog', 'SystemVerilog', 'RTL design', 'verification'],
    resources: [
      { title: 'Verilog course and exercises', source: 'HDLBits', url: 'https://hdlbits.01xz.net/wiki/Main_Page' },
      { title: 'Digital design learning resources', source: 'Nandland', url: 'https://nandland.com/learn-vhdl/' },
    ],
    project: 'Design and simulate a small UART or traffic-light controller in Verilog with a testbench.',
    steps: ['Boolean algebra and digital logic', 'Verilog and RTL fundamentals', 'Simulation and verification testbenches', 'Complete a synthesizable RTL project'],
    icon: 'chart',
    color: 'violet',
    interests: ['vlsi', 'chip', 'semiconductor', 'digital logic', 'silicon'],
    goals: ['projects', 'research', 'analysis'],
    level: 'Intermediate',
  }),
  createCareer({
    id: 'fpga-rtl',
    title: 'FPGA / RTL Design Engineer',
    domains: ['ece', 'vlsi'],
    description: 'Build and validate digital systems using hardware description languages and FPGA boards.',
    skills: ['Verilog', 'RTL', 'FPGA tools', 'timing constraints', 'testbenches'],
    resources: [
      { title: 'FPGA fundamentals', source: 'Project F', url: 'https://projectf.io/' },
      { title: 'Verilog practice problems', source: 'HDLBits', url: 'https://hdlbits.01xz.net/wiki/Main_Page' },
    ],
    project: 'Implement a digital stopwatch or UART on an entry-level FPGA development board.',
    steps: ['Digital logic and synchronous design', 'Write and simulate Verilog modules', 'Synthesize and constrain an FPGA design', 'Program and test a complete FPGA project'],
    icon: 'code',
    color: 'blue',
    interests: ['fpga', 'rtl', 'verilog', 'hardware description', 'digital design'],
    goals: ['projects', 'hands-on', 'research'],
    level: 'Intermediate',
  }),
  createCareer({
    id: 'robotics-engineer',
    title: 'Robotics Engineer',
    domains: ['robotics', 'embedded', 'iot'],
    description: 'Combine sensors, control systems, and software to build machines that sense and act.',
    skills: ['Python', 'C++', 'sensors', 'control systems', 'ROS basics'],
    resources: [
      { title: 'ROS 2 beginner tutorials', source: 'ROS', url: 'https://docs.ros.org/en/jazzy/Tutorials.html' },
      { title: 'Robotics learning resources', source: 'The Construct', url: 'https://www.theconstruct.ai/robotigniteacademy_learnros/ros-courses-library/' },
    ],
    project: 'Build a small obstacle-avoiding robot and document how its sensors inform movement.',
    steps: ['Programming and basic electronics', 'Motors, sensors, and feedback control', 'Robot simulation and ROS concepts', 'Build and test an autonomous robot'],
    icon: 'settings',
    color: 'orange',
    interests: ['robotics', 'automation', 'autonomous', 'control systems', 'robot'],
    goals: ['projects', 'hands-on', 'research'],
  }),
  createCareer({
    id: 'electrical-engineer',
    title: 'Electrical Engineer',
    domains: ['electrical'],
    description: 'Plan, analyze, and test electrical systems for energy, buildings, and industry.',
    skills: ['circuit analysis', 'power systems', 'MATLAB basics', 'electrical safety', 'measurement'],
    resources: [
      { title: 'Electrical engineering fundamentals', source: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/' },
      { title: 'Electrical safety basics', source: 'OSHA', url: 'https://www.osha.gov/electrical' },
    ],
    project: 'Model a small solar-powered system and compare load, storage, and energy use.',
    steps: ['Circuit and electrical fundamentals', 'Power, machines, and system safety', 'Model a practical electrical system', 'Present a measured design project'],
    icon: 'spark',
    color: 'orange',
    interests: ['electrical', 'power', 'energy', 'circuits', 'renewable'],
    goals: ['projects', 'hands-on', 'analysis'],
  }),
  createCareer({
    id: 'frontend-developer',
    title: 'Frontend Developer',
    domains: ['software'],
    description: 'Build responsive, accessible interfaces for useful web products.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'accessibility'],
    resources: [
      { title: 'Learn web development', source: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
      { title: 'React: Learn by doing', source: 'React.dev', url: 'https://react.dev/learn' },
    ],
    project: 'Create an accessible personal portfolio with a responsive project gallery.',
    steps: ['HTML and accessible page structure', 'CSS layouts and responsive design', 'JavaScript and React fundamentals', 'Build and publish a portfolio project'],
    interests: ['web', 'frontend', 'interface', 'javascript', 'website'],
  }),
  createCareer({
    id: 'machine-learning',
    title: 'AI and Machine Learning Engineer',
    domains: ['ai'],
    description: 'Use programming and data to train, evaluate, and apply machine learning models.',
    skills: ['Python', 'statistics', 'data preparation', 'scikit-learn', 'model evaluation'],
    resources: [
      { title: 'Machine learning course', source: 'Google', url: 'https://developers.google.com/machine-learning/crash-course' },
      { title: 'Python tutorials', source: 'Python.org', url: 'https://docs.python.org/3/tutorial/' },
    ],
    project: 'Train and evaluate a beginner classification model using a public, well-documented dataset.',
    steps: ['Python and data-handling basics', 'Statistics and machine-learning concepts', 'Train and evaluate baseline models', 'Document an end-to-end ML project'],
    icon: 'chart',
    color: 'violet',
    interests: ['ai', 'machine learning', 'artificial intelligence', 'models', 'python'],
    goals: ['projects', 'research', 'analysis'],
    level: 'Intermediate',
  }),
  createCareer({
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    domains: ['cybersecurity'],
    description: 'Help protect systems by understanding threats, monitoring activity, and improving defenses.',
    skills: ['networking', 'Linux', 'security fundamentals', 'log analysis', 'incident response'],
    resources: [
      { title: 'Cybersecurity learning paths', source: 'CISA', url: 'https://www.cisa.gov/cybersecurity-training-exercises' },
      { title: 'OverTheWire wargames', source: 'OverTheWire', url: 'https://overthewire.org/wargames/' },
    ],
    project: 'Set up a safe home lab and write a basic security checklist and incident log.',
    steps: ['Computer networks and Linux basics', 'Security principles and common threats', 'Practice safely in a beginner lab', 'Write a threat review and response plan'],
    icon: 'settings',
    color: 'green',
    interests: ['security', 'cybersecurity', 'privacy', 'defense', 'threats'],
    goals: ['projects', 'research', 'career-ready'],
  }),
  createCareer({
    id: 'cloud-network-engineer',
    title: 'Networking and Cloud Engineer',
    domains: ['cloud'],
    description: 'Connect and operate reliable networks and cloud infrastructure for digital services.',
    skills: ['TCP/IP', 'Linux', 'network troubleshooting', 'cloud basics', 'infrastructure'],
    resources: [
      { title: 'Networking basics', source: 'Cisco Skills for All', url: 'https://skillsforall.com/course/networking-basics' },
      { title: 'AWS Cloud Practitioner Essentials', source: 'AWS Skill Builder', url: 'https://skillbuilder.aws/learn/Cloud%20Practitioner%20Essentials' },
    ],
    project: 'Diagram and deploy a small static site with a documented network and cloud architecture.',
    steps: ['Networking concepts and TCP/IP', 'Linux and command-line tools', 'Cloud services and access controls', 'Deploy and monitor a small cloud project'],
    icon: 'grid',
    color: 'blue',
    interests: ['networking', 'cloud', 'infrastructure', 'systems', 'servers'],
    goals: ['projects', 'analysis', 'career-ready'],
  }),
  createCareer({
    id: 'data-analyst',
    title: 'Data Scientist and Analyst',
    domains: ['data'],
    description: 'Find useful patterns in data and communicate evidence-based recommendations.',
    skills: ['Python', 'SQL', 'spreadsheets', 'statistics', 'data visualization'],
    resources: [
      { title: 'SQLBolt interactive lessons', source: 'SQLBolt', url: 'https://sqlbolt.com/' },
      { title: 'Python data analysis', source: 'Kaggle Learn', url: 'https://www.kaggle.com/learn' },
    ],
    project: 'Analyze an open dataset, create clear visualizations, and explain three actionable findings.',
    steps: ['Spreadsheets, data types, and questions', 'SQL and Python fundamentals', 'Statistics and data visualization', 'Publish a reproducible analysis'],
    icon: 'chart',
    color: 'green',
    interests: ['data', 'analytics', 'statistics', 'insights', 'visualization'],
    goals: ['projects', 'analysis', 'research'],
  }),
  createCareer({
    id: 'product-designer',
    title: 'Product Designer / UX Designer',
    domains: ['product'],
    description: 'Research user needs and shape clear, inclusive product experiences from idea to prototype.',
    skills: ['user research', 'wireframing', 'prototyping', 'Figma', 'accessibility'],
    resources: [
      { title: 'Design learning resources', source: 'Figma Learn', url: 'https://help.figma.com/hc/en-us/categories/360002051613-Learn-design' },
      { title: 'Accessibility fundamentals', source: 'W3C WAI', url: 'https://www.w3.org/WAI/fundamentals/' },
    ],
    project: 'Interview a potential user and prototype an accessible solution to one everyday challenge.',
    steps: ['Design principles and accessibility', 'User interviews and problem framing', 'Wireframes and interactive prototypes', 'Test and refine a case-study project'],
    icon: 'design',
    color: 'violet',
    interests: ['design', 'ux', 'ui', 'product', 'research', 'figma'],
    goals: ['projects', 'design', 'career-ready'],
  }),
]

function Icon({ name, size = 20, ...props }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12Z" /><path d="M4 16a2 2 0 0 1 2-2h14M8 7h8" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 4 3 6-7" /><path d="M17 6h4v4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 2Z" transform="translate(-2 -1)" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    code: <><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14" /></>,
    design: <><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z" /><path d="m3.5 8.5 8.5 5 8.5-5M12 21v-7.5" /></>,
    play: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name] || paths.spark}
    </svg>
  )
}

function ProgressBar({ value, color = 'blue' }) {
  return (
    <div
      className={`progress-track progress-track--${color}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`${value}% complete`}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  )
}

function assessmentStorageKey(email) {
  return `${assessmentIdStorageKey}:${email.toLowerCase()}`
}

function readAssessmentId(email) {
  try {
    return window.localStorage.getItem(assessmentStorageKey(email)) || ''
  } catch {
    return null
  }
}

async function readApiResponse(response) {
  const result = response.status === 204 ? null : await response.json()
  if (!response.ok) {
    throw new Error(result?.detail || `The service returned HTTP ${response.status}.`)
  }
  return result
}

function accountInitials(account) {
  const identity = typeof account?.name === 'string' && account.name.trim()
    ? account.name.trim()
    : account?.email?.split('@')[0] || ''
  const parts = identity.split(/[.\s_-]+/).filter(Boolean)
  if (!parts.length) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function App() {
  const [initialData] = useState(() => {
    try {
      const savedProgress = window.localStorage.getItem(progressStorageKey)
      const parsedProgress = savedProgress ? JSON.parse(savedProgress) : []
      return {
        completedSkills: Array.isArray(parsedProgress)
          ? parsedProgress.filter((id) => Number.isInteger(id))
          : [],
        storageMessage: '',
      }
    } catch {
      return {
        completedSkills: [],
        storageMessage: 'On-device roadmap progress could not be loaded from this browser.',
      }
    }
  })
  const [assessment, setAssessment] = useState(defaultAssessment)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [assessmentStatus, setAssessmentStatus] = useState('idle')
  const [assessmentError, setAssessmentError] = useState('')
  const [completedSkills, setCompletedSkills] = useState(initialData.completedSkills)
  const [storageMessage, setStorageMessage] = useState(initialData.storageMessage)
  const [assessmentMessage, setAssessmentMessage] = useState('')
  const [roadmapStatus, setRoadmapStatus] = useState('idle')
  const [roadmapError, setRoadmapError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [confirmProgressReset, setConfirmProgressReset] = useState(false)
  const [account, setAccount] = useState(null)
  const [savedAssessmentId, setSavedAssessmentId] = useState('')
  const [authStatus, setAuthStatus] = useState('loading')
  const [authMode, setAuthMode] = useState('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [csrfToken, setCsrfToken] = useState('')
  const [backendCareers, setBackendCareers] = useState([])
  const [backendCareersStatus, setBackendCareersStatus] = useState('loading')
  const [backendCareersError, setBackendCareersError] = useState('')
  const [careerRetry, setCareerRetry] = useState(0)
  const [projects, setProjects] = useState([])
  const [projectsStatus, setProjectsStatus] = useState('loading')
  const [projectsError, setProjectsError] = useState('')
  const [companies, setCompanies] = useState([])
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [companyNotice, setCompanyNotice] = useState('')
  const [companySearch, setCompanySearch] = useState('')
  const [companyDomainFilter, setCompanyDomainFilter] = useState('all')
  const [companyError, setCompanyError] = useState('')
  const [xpSummary, setXpSummary] = useState(null)
  const [xpError, setXpError] = useState('')
  const [projectBusyKey, setProjectBusyKey] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function restoreSession() {
      try {
        const csrfResponse = await fetch(`${authApiUrl}/csrf`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!csrfResponse.ok) throw new Error(`Security setup returned HTTP ${csrfResponse.status}.`)
        const csrfResult = await csrfResponse.json()
        setCsrfToken(csrfResult.token)

        const response = await fetch(`${authApiUrl}/me`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (response.ok) {
          const currentAccount = await response.json()
          const savedId = readAssessmentId(currentAccount.email)
          if (savedId === null) {
            setStorageMessage('Saved assessment details could not be loaded from this browser.')
          } else {
            setSavedAssessmentId(savedId)
          }
          setAccount(currentAccount)
        } else if (response.status !== 401) {
          throw new Error(`Session check returned HTTP ${response.status}.`)
        }
        setAuthStatus('ready')
      } catch (error) {
        if (error.name === 'AbortError') return
        setAuthError(error instanceof Error ? error.message : 'Could not initialize sign in.')
        setAuthStatus('ready')
      }
    }

    restoreSession()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCareers() {
      setBackendCareersStatus('loading')
      setBackendCareersError('')

      try {
        const response = await fetch(careersApiUrl, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`The career service returned HTTP ${response.status}.`)
        }

        const careers = await response.json()
        if (!Array.isArray(careers) || careers.some((career) => (
          !career
          || typeof career.id !== 'number'
          || typeof career.title !== 'string'
          || typeof career.domain !== 'string'
          || typeof career.description !== 'string'
          || !Array.isArray(career.skills)
        ))) {
          throw new Error('The career service returned data in an unexpected format.')
        }

        setBackendCareers(careers)
        setBackendCareersStatus('success')
      } catch (error) {
        if (error.name === 'AbortError') return

        setBackendCareersError(error instanceof Error ? error.message : 'An unexpected error occurred.')
        setBackendCareersStatus('error')
      }
    }

    loadCareers()
    return () => controller.abort()
  }, [careerRetry])

  useEffect(() => {
    if (!account || !csrfToken) return undefined
    const controller = new AbortController()

    async function loadPersonalFeatures() {
      setProjectsStatus('loading')
      setProjectsError('')
      setCompanyError('')
      setXpError('')
      try {
        const [projectResponse, companyResponse, xpResponse] = await Promise.all([
          fetch(projectsApiUrl, { credentials: 'include', signal: controller.signal }),
          fetch(companyPreferencesApiUrl, { credentials: 'include', signal: controller.signal }),
          fetch(xpApiUrl, { credentials: 'include', signal: controller.signal }),
        ])
        const [projectData, companyData, xpData] = await Promise.all([
          readApiResponse(projectResponse),
          readApiResponse(companyResponse),
          readApiResponse(xpResponse),
        ])
        setProjects(projectData)
        setCompanies(companyData.companies)
        setSelectedCompanies(companyData.selectedCompanyKeys)
        setCompanyNotice(companyData.notice)
        setXpSummary(xpData)
        setProjectsStatus('success')
      } catch (error) {
        if (error.name === 'AbortError') return
        const message = error instanceof Error ? error.message : 'Could not load projects and preferences.'
        setProjectsError(message)
        setCompanyError(message)
        setXpError(message)
        setProjectsStatus('error')
      }
    }

    loadPersonalFeatures()
    return () => controller.abort()
  }, [account, csrfToken])

  useEffect(() => {
    if (!account || !savedAssessmentId) return undefined

    const controller = new AbortController()
    async function restoreAssessment() {
      setAssessmentStatus('loading')
      setAssessmentError('')
      try {
        const response = await fetch(`${assessmentsApiUrl}/${savedAssessmentId}`, {
          credentials: 'include',
          signal: controller.signal,
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.detail || `The assessment service returned HTTP ${response.status}.`)
        }
        if (!result || !Number.isInteger(result.id) || !Array.isArray(result.recommendations)
          || !Array.isArray(result.domains) || !Array.isArray(result.goals) || !Array.isArray(result.roadmap)) {
          throw new Error('The assessment service returned data in an unexpected format.')
        }

        setAssessmentResult(result)
        setAssessment({
          domains: result.domains,
          interests: result.interests,
          customInterest: result.customInterest,
          experience: result.skillLevel,
          goals: result.goals,
        })
        setAssessmentStatus('success')
      } catch (error) {
        if (error.name === 'AbortError') return
        setAssessmentError(error instanceof Error ? error.message : 'An unexpected error occurred.')
        setAssessmentStatus('error')
      }
    }

    restoreAssessment()
    return () => controller.abort()
  }, [account, savedAssessmentId])

  const careerRecommendations = useMemo(() => {
    return (assessmentResult?.recommendations || []).map((match) => {
      const domainId = ({
        ECE: 'ece',
        'Embedded Systems': 'embedded',
        IoT: 'iot',
        VLSI: 'vlsi',
        Robotics: 'robotics',
        Electrical: 'electrical',
        'Software Development': 'software',
        'AI/ML': 'ai',
        Cybersecurity: 'cybersecurity',
        'Cloud/Networking': 'cloud',
        'Data Science': 'data',
        'UI/UX': 'product',
      })[match.domain]
      const visualCareer = careerLibrary.find((career) => career.domains.includes(domainId))

      return {
        id: match.careerId,
        careerId: match.careerId,
        title: match.title,
        domain: match.domain,
        description: match.description,
        match: match.matchScore,
        reason: match.reason,
        skills: match.skills.map((skill) => skill.title),
        roadmap: match.skills,
        resources: visualCareer?.resources || [],
        icon: visualCareer?.icon || 'compass',
        color: visualCareer?.color || 'blue',
      }
    })
  }, [assessmentResult])
  const selectedRoadmapCareer = careerRecommendations.find(
    (career) => career.careerId === assessmentResult?.selectedCareerId,
  )

  const roadmap = useMemo(() => {
    return (assessmentResult?.roadmap || []).map((skill) => ({
      ...skill,
      category: 'Ordered roadmap skill',
      duration: `Step ${skill.position}`,
      level: assessmentResult.skillLevel,
    }))
  }, [assessmentResult])
  const resources = useMemo(() => {
    const seen = new Set()
    return careerRecommendations
      .slice(0, 3)
      .flatMap((career) => career.resources.map((resource) => ({
        ...resource,
        career: career.title,
        icon: career.icon,
      })))
      .filter((resource) => {
        if (seen.has(resource.url)) return false
        seen.add(resource.url)
        return true
      })
      .slice(0, 6)
  }, [careerRecommendations])

  const completedActiveSkills = roadmap.filter((skill) => completedSkills.includes(skill.id))
  const completedCount = completedActiveSkills.length
  const roadmapProgress = roadmap.length ? Math.round((completedCount / roadmap.length) * 100) : 0
  const nextSkill = roadmap.find((skill) => !completedSkills.includes(skill.id))
  const learningHours = useMemo(() => 18 + completedCount * 4, [completedCount])
  const weeklyLearningHours = Math.min(6, completedCount * 2)

  async function reloadXp() {
    const response = await fetch(xpApiUrl, { credentials: 'include' })
    setXpSummary(await readApiResponse(response))
  }

  async function mutateProject(path) {
    setProjectBusyKey(path)
    setProjectsError('')
    try {
      const response = await fetch(`${projectsApiUrl}/${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      })
      const updatedProject = await readApiResponse(response)
      setProjects((current) => current.map((project) => (
        project.key === updatedProject.key ? updatedProject : project
      )))
      await reloadXp()
    } catch (error) {
      setProjectsError(error instanceof Error ? error.message : 'Could not update project progress.')
    } finally {
      setProjectBusyKey('')
    }
  }

  async function updateCompanyPreferences(nextSelected) {
    setCompanyError('')
    try {
      const response = await fetch(companyPreferencesApiUrl, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({ companyKeys: nextSelected }),
      })
      const result = await readApiResponse(response)
      setSelectedCompanies(result.selectedCompanyKeys)
      setCompanyNotice(result.notice)
      const projectResponse = await fetch(projectsApiUrl, { credentials: 'include' })
      setProjects(await readApiResponse(projectResponse))
      if (assessmentResult) {
        const recommendationResponse = await fetch(`${assessmentsApiUrl}/recommendations`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'X-XSRF-TOKEN': csrfToken },
        })
        const updatedAssessment = await readApiResponse(recommendationResponse)
        setAssessmentResult(updatedAssessment)
      }
    } catch (error) {
      setCompanyError(error instanceof Error ? error.message : 'Could not update company preferences.')
    }
  }

  function updateAssessment(patch) {
    const nextAssessment = { ...assessment, ...patch }
    setAssessment(nextAssessment)
    setAssessmentMessage('')
    setAssessmentError('')
  }

  function toggleSkill(skillId) {
    const nextSkills = completedSkills.includes(skillId)
      ? completedSkills.filter((id) => id !== skillId)
      : [...completedSkills, skillId]
    setCompletedSkills(nextSkills)

    try {
      window.localStorage.setItem(progressStorageKey, JSON.stringify(nextSkills))
      setStorageMessage('Roadmap completion progress is saved only on this device.')
    } catch {
      setStorageMessage('Roadmap progress could not be saved on this device.')
    }
  }

  function clearRoadmapProgress() {
    try {
      window.localStorage.setItem(progressStorageKey, '[]')
      setCompletedSkills([])
      setStorageMessage('Roadmap progress was cleared from this device.')
      setConfirmProgressReset(false)
    } catch {
      setStorageMessage('Roadmap progress could not be cleared from this device.')
    }
  }

  async function submitAuth(event) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthError('')
    setAuthMessage('')
    try {
      const endpoint = authMode === 'register' ? 'register' : 'login'
      const response = await fetch(`${authApiUrl}/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ email: authEmail.trim(), password: authPassword }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.detail || `Authentication returned HTTP ${response.status}.`)
      }
      setAuthPassword('')
      if (authMode === 'register') {
        setAuthMode('login')
        setAuthMessage('Account created. Sign in with your new credentials.')
      } else {
        const savedId = readAssessmentId(result.email)
        if (savedId === null) {
          setStorageMessage('Saved assessment details could not be loaded from this browser.')
          setSavedAssessmentId('')
        } else {
          setSavedAssessmentId(savedId)
        }
        setProjects([])
        setCompanies([])
        setSelectedCompanies([])
        setXpSummary(null)
        setProjectsStatus('loading')
        setAccount(result)
        setAuthStatus('ready')
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not complete the request.')
    } finally {
      setAuthBusy(false)
    }
  }

  async function logout() {
    setAuthBusy(true)
    setAuthError('')
    try {
      const response = await fetch(`${authApiUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      })
      if (!response.ok) {
        throw new Error(`Sign out returned HTTP ${response.status}.`)
      }
      setAccount(null)
      setSavedAssessmentId('')
      setAssessmentResult(null)
      setAssessment(defaultAssessment)
      setAssessmentStatus('idle')
      setAssessmentError('')
      setAssessmentMessage('')
      setRoadmapStatus('idle')
      setProjects([])
      setCompanies([])
      setSelectedCompanies([])
      setXpSummary(null)
      setProjectsStatus('loading')
      const csrfResponse = await fetch(`${authApiUrl}/csrf`, { credentials: 'include' })
      if (!csrfResponse.ok) throw new Error(`Security setup returned HTTP ${csrfResponse.status}.`)
      const csrfResult = await csrfResponse.json()
      setCsrfToken(csrfResult.token)
      setAuthMode('login')
      setAuthMessage('You have been signed out.')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not sign out.')
    } finally {
      setAuthBusy(false)
    }
  }

  async function submitAssessment(event) {
    event.preventDefault()
    if (assessment.domains.length === 0) {
      setAssessmentMessage('Choose at least one career domain.')
      return
    }
    if (!assessment.interests.trim()) {
      setAssessmentMessage('Add at least one interest or topic you enjoy.')
      return
    }
    if (assessment.goals.length === 0) {
      setAssessmentMessage('Choose at least one learning goal.')
      return
    }

    setAssessmentStatus('saving')
    setAssessmentError('')
    setAssessmentMessage('')
    try {
      const response = await fetch(assessmentsApiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({
          domains: assessment.domains,
          interests: assessment.interests,
          customInterest: assessment.customInterest,
          skillLevel: assessment.experience,
          goals: assessment.goals,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.detail || `The assessment service returned HTTP ${response.status}.`)
      }
      if (!result || !Number.isInteger(result.id) || !Array.isArray(result.recommendations)
        || !Array.isArray(result.roadmap)) {
        throw new Error('The assessment service returned data in an unexpected format.')
      }

      setAssessmentResult(result)
      setAssessmentStatus('success')
      setRoadmapStatus('idle')
      setRoadmapError('')
      setCompletedSkills([])
      try {
        window.localStorage.setItem(assessmentStorageKey(account.email), String(result.id))
        window.localStorage.setItem(progressStorageKey, '[]')
        setStorageMessage('')
      } catch {
        setStorageMessage('Assessment and recommendations are saved on the server, but this device could not remember the assessment ID for reload.')
      }
      setAssessmentMessage('Assessment and recommendations saved to the server.')
    } catch (error) {
      setAssessmentError(error instanceof Error ? error.message : 'An unexpected error occurred.')
      setAssessmentStatus('error')
    }
  }

  async function selectRoadmap(careerId) {
    if (!assessmentResult) return
    setRoadmapStatus('saving')
    setRoadmapError('')
    try {
      const response = await fetch(`${assessmentsApiUrl}/${assessmentResult.id}/roadmap`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': csrfToken },
        body: JSON.stringify({ careerId }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.detail || `The roadmap service returned HTTP ${response.status}.`)
      }
      if (!result || !Array.isArray(result.roadmap) || result.selectedCareerId !== careerId) {
        throw new Error('The roadmap service returned data in an unexpected format.')
      }
      setAssessmentResult(result)
      setRoadmapStatus('success')
    } catch (error) {
      setRoadmapError(error instanceof Error ? error.message : 'An unexpected error occurred.')
      setRoadmapStatus('error')
    }
  }

  const navItems = [
    { label: 'Overview', href: '#overview', icon: 'grid', active: true },
    { label: 'Career assessment', href: '#assessment', icon: 'compass' },
    { label: 'My roadmap', href: '#roadmap', icon: 'map' },
    { label: 'Learning resources', href: '#resources', icon: 'book' },
    { label: 'My progress', href: '#progress', icon: 'chart' },
    { label: 'Projects', href: '#projects', icon: 'code' },
    { label: 'Companies', href: '#companies', icon: 'grid' },
    { label: 'XP & levels', href: '#xp', icon: 'spark' },
  ]

  if (authStatus === 'loading') {
    return <main className="auth-shell"><p role="status">Checking your session…</p></main>
  }

  if (!account) {
    const isRegistration = authMode === 'register'
    return (
      <main className="auth-shell">
        <section className="auth-card" aria-labelledby="auth-title">
          <a className="brand auth-brand" href="#overview" aria-label="Pathway home">
            <span className="brand-mark"><Icon name="spark" size={22} /></span>
            <span>pathway<span className="brand-period">.</span></span>
          </a>
          <p className="section-kicker">YOUR CAREER JOURNEY</p>
          <h1 id="auth-title">{isRegistration ? 'Create your account' : 'Welcome back'}</h1>
          <p className="auth-description">
            {isRegistration
              ? 'Save your career assessment and roadmap to your account.'
              : 'Sign in to continue to your career dashboard.'}
          </p>
          {authError && <div className="auth-feedback auth-feedback--error" role="alert">{authError}</div>}
          {authMessage && <div className="auth-feedback" role="status">{authMessage}</div>}
          <form className="auth-form" onSubmit={submitAuth}>
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
            />
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isRegistration ? 'new-password' : 'current-password'}
              required
              minLength={isRegistration ? 12 : undefined}
              maxLength={72}
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
            />
            {isRegistration && (
              <p className="auth-password-hint">Use 12–72 characters. Passwords are hashed before storage.</p>
            )}
            <button className="button button--primary auth-submit" type="submit" disabled={authBusy || !csrfToken}>
              {authBusy ? 'Please wait…' : isRegistration ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <p className="auth-switch">
            {isRegistration ? 'Already have an account?' : 'New to Pathway?'}{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode(isRegistration ? 'login' : 'register')
                setAuthError('')
                setAuthMessage('')
              }}
            >
              {isRegistration ? 'Sign in' : 'Create an account'}
            </button>
          </p>
          <p className="auth-public-note">Career browsing remains available after you sign in.</p>
        </section>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <a className="brand" href="#overview" aria-label="Pathway home">
          <span className="brand-mark"><Icon name="spark" size={22} /></span>
          <span>pathway<span className="brand-period">.</span></span>
        </a>

        <div className="sidebar-label">MENU</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.label}
              className={`nav-link ${item.active ? 'nav-link--active' : ''}`}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === 'My roadmap' && <span className="nav-count">{completedCount}/{roadmap.length}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="mentor-card">
            <span className="mentor-icon"><Icon name="spark" size={17} /></span>
            <strong>Small steps add up.</strong>
            <p>You’re building skills for a future you’ll love.</p>
            <a href="#roadmap">Keep going <Icon name="arrow" size={15} /></a>
          </div>
          <a
            className="nav-link settings-link"
            href="#settings"
            onClick={() => setMenuOpen(false)}
          >
            <Icon name="settings" size={19} /><span>Settings</span>
          </a>
          <div className="sidebar-footer">© 2026 Pathway <span>•</span> Your journey, your pace.</div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="sample-badge account-badge"><span /> {account.email}</span>
            <button className="button button--outline signout-button" type="button" disabled={authBusy} onClick={logout}>
              {authBusy ? 'Signing out…' : 'Sign out'}
            </button>
            <div className="topbar-notifications">
              <button
                className="icon-button notification-button"
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                aria-controls="notifications-panel"
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Icon name="bell" />
              </button>
              {notificationsOpen && (
                <section className="notifications-panel" id="notifications-panel" aria-label="Notifications">
                  <div className="notifications-panel-heading">
                    <strong>Notifications</strong>
                    <button
                      type="button"
                      className="notifications-close"
                      aria-label="Close notifications"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  <p role="status">You&apos;re all caught up — no notifications yet.</p>
                </section>
              )}
            </div>
            <a className="topbar-profile" href="#profile" aria-label="Student profile">
              <span className="avatar avatar--small">{accountInitials(account)}</span>
              <span className="profile-chevron">⌄</span>
            </a>
          </div>
        </header>

        <div className="dashboard">
          <section className="welcome-row" id="profile">
            <div>
              <p className="eyebrow">SUNDAY, OCTOBER 11, 2026 <span className="eyebrow-divider">·</span> YOUR CAREER JOURNEY</p>
              <h1>
                Good morning{typeof account.name === 'string' && account.name.trim()
                  ? `, ${account.name.trim()}`
                  : ''} <span className="wave">✦</span>
              </h1>
              <p className="welcome-subtitle">You’re making great progress. Let’s keep the momentum going.</p>
            </div>
            <button className="button button--primary" type="button" onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}>
              <Icon name="map" size={17} /> View my roadmap
            </button>
          </section>

          <section className="hero-card" aria-labelledby="hero-title">
            <div className="hero-copy">
              <span className="hero-kicker"><Icon name="spark" size={15} /> YOUR PERSONALIZED PATH</span>
              <h2 id="hero-title">
                {careerRecommendations.length
                  ? <>A future in <span>{careerRecommendations[0].title}</span> starts here.</>
                  : <>A future shaped by <span>your choices</span> starts here.</>}
              </h2>
              <p>
                {careerRecommendations.length
                  ? `Your learning path is tailored to ${assessment.domains.map((id) => domains.find((domain) => domain.id === id)?.label).filter(Boolean).join(', ')}.`
                  : 'Choose the career domains that interest you to build a roadmap that feels right for you.'}
              </p>
              <a className="hero-link" href="#roadmap">Explore your learning path <Icon name="arrow" size={17} /></a>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit--outer" />
              <div className="orbit orbit--inner" />
              <div className="hero-spark hero-spark--one">✦</div>
              <div className="hero-spark hero-spark--two">✧</div>
              <div className="hero-code-card">
                <div className="code-card-top"><span /><span /><span /><i>your-next-step.jsx</i></div>
                <div className="code-lines"><b>01</b><span><i>const</i> <strong>yourFuture</strong> = <em>'bright'</em>;</span></div>
                <div className="code-lines"><b>02</b><span><i>keepGoing</i>(); <span className="cursor">|</span></span></div>
                <div className="code-lines"><b>03</b><span className="code-muted">// you’ve got this</span></div>
              </div>
              <div className="floating-check"><Icon name="check" size={17} /></div>
            </div>
            <div className="hero-bottom-note"><span className="hero-note-mark">✳</span> BUILT AROUND YOU <span>·</span> ONE STEP AT A TIME</div>
          </section>

          <section className="stat-grid" id="progress" aria-label="Your progress statistics">
            <article className="stat-card">
              <div className="stat-icon stat-icon--blue"><Icon name="map" /></div>
              <div className="stat-label">ROADMAP PROGRESS</div>
              <div className="stat-value">{roadmapProgress}<span>%</span></div>
              <ProgressBar value={roadmapProgress} />
              <p>{completedCount} of {roadmap.length} skills completed</p>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-icon--orange"><Icon name="spark" /></div>
              <div className="stat-label">LEARNING STREAK</div>
              <div className="stat-value">5<span className="stat-unit"> days</span></div>
              <div className="streak-dots" aria-label="5 day streak"><i /><i /><i /><i /><i /><i className="streak-rest" /><i className="streak-rest" /></div>
              <p>You’re on a roll — keep it up!</p>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-icon--green"><Icon name="clock" /></div>
              <div className="stat-label">TIME INVESTED</div>
              <div className="stat-value">{learningHours}<span className="stat-unit"> hrs</span></div>
              <div className="stat-trend"><span>↗</span> +4 hrs this week</div>
              <p>Your effort is adding up</p>
            </article>
            <article className="stat-card stat-card--focus">
              <div className="stat-icon stat-icon--violet"><Icon name="compass" /></div>
              <div className="stat-label">CURRENT FOCUS</div>
              <div className="focus-name">{nextSkill ? nextSkill.title : roadmap.length ? 'Roadmap complete!' : 'Choose a career domain'}</div>
              <p><Icon name="clock" size={14} /> {nextSkill ? `${nextSkill.duration} · ${nextSkill.level}` : roadmap.length ? 'You did it — amazing work!' : 'Start with your assessment'}</p>
              <a href="#roadmap">Pick up where you left off <Icon name="arrow" size={14} /></a>
            </article>
          </section>

          <div className="content-grid">
            <section className="panel assessment-panel" id="assessment">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">LET’S GET TO KNOW YOU</span>
                  <h2>Your career assessment</h2>
                </div>
                <span className="sample-tag">CAREER PROFILE</span>
              </div>
              <div className="student-summary">
                <span className="avatar avatar--large">{accountInitials(account)}</span>
                <div className="student-copy">
                  <strong>
                    {typeof account.name === 'string' && account.name.trim()
                      ? account.name.trim()
                      : account.email}
                  </strong>
                  <span>Undergraduate student <i>·</i> Year 2</span>
                  <span className="student-interest"><Icon name="spark" size={14} /> {assessment.domains.length
                    ? `${assessment.domains.length} career domain${assessment.domains.length === 1 ? '' : 's'} selected`
                    : 'Choose the fields that interest you'}</span>
                </div>
                <div className="assessment-score">
                  <span>TOP CAREER MATCH</span>
                  <strong>{careerRecommendations[0] ? <>{careerRecommendations[0].match}<span>%</span></> : '—'}</strong>
                </div>
              </div>
              <div className="assessment-insight">
                <span className="insight-icon"><Icon name="spark" size={17} /></span>
                <p>
                  <strong>{careerRecommendations.length
                    ? `Your choices currently point toward ${careerRecommendations[0].title}.`
                    : 'You’re in control of the direction.'}</strong>{' '}
                  Select your domains, interests, skill level, and goals. Matches are scored against careers in the server catalog.
                </p>
              </div>
              {assessmentStatus === 'loading' && (
                <p className="backend-career-message" role="status"><span className="loading-indicator" /> Loading your saved assessment…</p>
              )}
              {assessmentError && <p className="assessment-error" role="alert">{assessmentError}</p>}
              {assessmentResult && (
                <p className="assessment-saved-note" role="status">
                  Saved assessment #{assessmentResult.id} on the server.
                  {assessment.domains.join() !== assessmentResult.domains.join()
                    || assessment.interests !== assessmentResult.interests
                    || assessment.customInterest !== assessmentResult.customInterest
                    || assessment.experience !== assessmentResult.skillLevel
                    || assessment.goals.join() !== assessmentResult.goals.join()
                    ? ' Current form edits are not saved yet.'
                    : ''}
                </p>
              )}
              <form className="assessment-form" onSubmit={submitAssessment}>
                <fieldset className="domain-fieldset">
                  <legend>Which career domains would you like to explore? <span>Select one or more</span></legend>
                  <div className="domain-grid">
                    {domains.map((domain) => {
                      const isSelected = assessment.domains.includes(domain.id)
                      return (
                        <label className={`domain-option ${isSelected ? 'domain-option--selected' : ''}`} key={domain.id}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => updateAssessment({
                              domains: event.target.checked
                                ? [...assessment.domains, domain.id]
                                : assessment.domains.filter((id) => id !== domain.id),
                            })}
                          />
                          <span className="domain-option-icon"><Icon name={domain.icon} size={16} /></span>
                          <span>{domain.label}</span>
                          <span className="domain-check"><Icon name="check" size={13} /></span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
                <label className="assessment-wide-field">
                  Interests and topics you enjoy <span className="field-hint">Separate topics with commas</span>
                  <input
                    type="text"
                    maxLength={1000}
                    required
                    value={assessment.interests}
                    placeholder="e.g. circuit design, smart devices, automation"
                    onChange={(event) => updateAssessment({ interests: event.target.value })}
                  />
                </label>
                <label className="assessment-wide-field">
                  Custom interests or a role not listed <span className="optional-label">Optional</span>
                  <input
                    type="text"
                    maxLength={300}
                    value={assessment.customInterest}
                    placeholder="e.g. renewable energy research"
                    onChange={(event) => updateAssessment({ customInterest: event.target.value })}
                  />
                </label>
                <label>
                  Current skill level
                  <select value={assessment.experience} onChange={(event) => updateAssessment({ experience: event.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
                <fieldset className="goal-fieldset">
                  <legend>What are your learning goals? <span>Select at least one</span></legend>
                  <div className="goal-options">
                    {goalOptions.map((goal) => (
                      <label className="goal-option" key={goal.id}>
                        <input
                          type="checkbox"
                          checked={assessment.goals.includes(goal.id)}
                          onChange={(event) => updateAssessment({
                            goals: event.target.checked
                              ? [...assessment.goals, goal.id]
                              : assessment.goals.filter((id) => id !== goal.id),
                          })}
                        />
                        <span>{goal.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="assessment-submit-row">
                  {assessmentMessage && <span className="form-feedback" role="status">{assessmentMessage}</span>}
                  <button className="button button--outline" type="submit" disabled={assessmentStatus === 'saving'}>
                    {assessmentStatus === 'saving' ? 'Saving…' : 'Save assessment to server'} <Icon name="arrow" size={15} />
                  </button>
                </div>
              </form>
            </section>

            <section className="panel careers-panel" aria-labelledby="careers-title">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">BASED ON YOUR PROFILE</span>
                  <h2 id="careers-title">Career matches</h2>
                </div>
                <a className="text-link" href="#assessment">Edit assessment <Icon name="arrow" size={14} /></a>
              </div>
              {assessmentStatus === 'loading' || assessmentStatus === 'saving' ? (
                <p className="backend-career-message" role="status"><span className="loading-indicator" /> {assessmentStatus === 'saving' ? 'Matching careers and saving your assessment…' : 'Loading saved recommendations…'}</p>
              ) : careerRecommendations.length > 0 ? (
                <div className="career-list">
                  {careerRecommendations.map((career, index) => (
                    <article className="career-item career-item--detailed" key={career.id}>
                      <div className={`career-icon career-icon--${career.color}`}><Icon name={career.icon} size={19} /></div>
                      <div className="career-info">
                        <div className="career-title-row"><h3>{career.title}</h3><span className="match-value">{career.match}% <small>fit</small></span></div>
                        <p>{career.description}</p>
                        <p className="career-match-reason"><strong>Why it matches:</strong> {career.reason}</p>
                        <div className="career-subheading">Required skills</div>
                        <div className="skill-pills">{career.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                        <details className="career-path-details">
                          <summary>Explore this career’s ordered skills</summary>
                          <div className="career-detail-content">
                            <strong>Catalog skill order</strong>
                            <ol className="career-steps">
                              {career.roadmap.map((step) => <li key={step.id}>{step.title}</li>)}
                            </ol>
                          </div>
                        </details>
                        <button
                          className="button button--outline roadmap-select-button"
                          type="button"
                          disabled={roadmapStatus === 'saving' || assessmentResult.selectedCareerId === career.careerId}
                          onClick={() => selectRoadmap(career.careerId)}
                        >
                          {assessmentResult.selectedCareerId === career.careerId ? 'Roadmap selected' : 'Build this roadmap'}
                          <Icon name={assessmentResult.selectedCareerId === career.careerId ? 'check' : 'arrow'} size={14} />
                        </button>
                      </div>
                      {index === 0 && <span className="top-match">BEST FIT</span>}
                    </article>
                  ))}
                </div>
              ) : assessmentResult ? (
                <div className="empty-state">
                  <span className="empty-state-icon"><Icon name="compass" size={22} /></span>
                  <strong>No matching careers found.</strong>
                  <p>The saved domain and interest terms did not match a career in the current catalog. Try another domain or custom interest.</p>
                  <a href="#assessment">Adjust your assessment <Icon name="arrow" size={14} /></a>
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-state-icon"><Icon name="compass" size={22} /></span>
                  <strong>Your options are open.</strong>
                  <p>Complete and save the assessment to get recommendations from the live career catalog.</p>
                  <a href="#assessment">Start your assessment <Icon name="arrow" size={14} /></a>
                </div>
              )}
              {roadmapError && <p className="assessment-error" role="alert">{roadmapError}</p>}
              <p className="sample-footnote">Rule-based fit score: 50 base points, +30 for a domain match, +5 per matching interest term (up to 20), and +5 per aligned goal (up to 15), capped at 100. A result needs a domain or interest match; explanations list the matched inputs.</p>
              <div className="backend-career-catalog" aria-labelledby="backend-careers-title">
                <div className="backend-career-heading">
                  <div>
                    <span className="section-kicker">LIVE FROM YOUR BACKEND</span>
                    <h3 id="backend-careers-title">Available career paths</h3>
                  </div>
                  {backendCareersStatus === 'success' && (
                    <span className="backend-career-count">{backendCareers.length} paths</span>
                  )}
                </div>
                {backendCareersStatus === 'loading' && (
                  <p className="backend-career-message" role="status" aria-live="polite">
                    <span className="loading-indicator" /> Loading careers from the server…
                  </p>
                )}
                {backendCareersStatus === 'error' && (
                  <div className="backend-career-error" role="alert">
                    <p>Couldn’t load career paths. {backendCareersError} Check that the backend is running and retry.</p>
                    <button className="button button--outline" type="button" onClick={() => setCareerRetry((attempt) => attempt + 1)}>
                      Try again <Icon name="arrow" size={14} />
                    </button>
                  </div>
                )}
                {backendCareersStatus === 'success' && backendCareers.length === 0 && (
                  <p className="backend-career-message" role="status">No career paths are available yet.</p>
                )}
                {backendCareersStatus === 'success' && backendCareers.length > 0 && (
                  <div className="backend-career-list">
                    {backendCareers.map((career) => (
                      <details className="backend-career-item" key={career.id}>
                        <summary>
                          <span className="backend-career-domain">{career.domain}</span>
                          <strong>{career.title}</strong>
                          <span className="backend-career-skill-count">{career.skills.length} skills</span>
                        </summary>
                        <p>{career.description}</p>
                        {career.skills.length > 0 ? (
                          <ul className="backend-skill-list">
                            {career.skills.map((skill) => (
                              <li key={skill.id}>
                                <strong>{skill.title}</strong>
                                <span>{skill.description}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="backend-career-message">No skills have been added for this path yet.</p>
                        )}
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="content-grid content-grid--lower">
            <section className="panel roadmap-panel" id="roadmap">
              <div className="section-heading roadmap-heading">
                <div>
                  <span className="section-kicker">YOUR NEXT STEPS</span>
                  <h2>Personalized learning roadmap</h2>
                  <p className="section-description">{selectedRoadmapCareer
                    ? `Ordered skills for ${selectedRoadmapCareer.title}, saved with your assessment.`
                    : 'Choose “Build this roadmap” on a career match to save its ordered skill path.'}</p>
                </div>
                <div className="roadmap-completion"><strong>{completedCount}/{roadmap.length}</strong><span>skills done</span></div>
              </div>
              {roadmap.length > 0 ? <div className="roadmap-list">
                {roadmap.map((skill, index) => {
                  const isComplete = completedSkills.includes(skill.id)
                  return (
                    <article className={`roadmap-item ${isComplete ? 'roadmap-item--complete' : ''}`} key={skill.id}>
                      <div className="roadmap-step">
                        <span className={`step-number ${isComplete ? 'step-number--complete' : ''}`}>
                          {isComplete ? <Icon name="check" size={15} /> : String(index + 1).padStart(2, '0')}
                        </span>
                        {index < roadmap.length - 1 && <span className="step-line" />}
                      </div>
                      <div className="roadmap-detail">
                        <div className="roadmap-title-row">
                          <div><span className="roadmap-category">{skill.category}</span><h3>{skill.title}</h3></div>
                          <button
                            className={`complete-button ${isComplete ? 'complete-button--done' : ''}`}
                            type="button"
                            onClick={() => toggleSkill(skill.id)}
                            aria-pressed={isComplete}
                          >
                            <Icon name="check" size={14} /> {isComplete ? 'Completed' : 'Mark complete'}
                          </button>
                        </div>
                        <p>{skill.description}</p>
                        <div className="roadmap-meta"><span><Icon name="map" size={14} /> {skill.duration}</span><i /><span>Catalog order · {skill.level} level selected</span></div>
                      </div>
                    </article>
                  )
                })}
              </div> : (
                <div className="empty-state empty-state--compact">
                  <strong>Your roadmap will start here.</strong>
                  <p>Save an assessment, then choose one of its recommended careers to create your ordered skill roadmap.</p>
                  <a href="#careers-title">Explore career matches <Icon name="arrow" size={14} /></a>
                </div>
              )}
              <div className="roadmap-footer"><span><Icon name="spark" size={15} /> Your path adapts as you grow.</span><a href="#resources">Explore learning resources <Icon name="arrow" size={14} /></a></div>
            </section>

            <section className="panel resources-panel" id="resources">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">HAND-PICKED FOR YOU</span>
                  <h2>Learning resources</h2>
                </div>
                <a className="text-link" href="#assessment">Edit goals <Icon name="arrow" size={14} /></a>
              </div>
                <p className="resources-intro">{careerRecommendations.length
                  ? `Beginner-friendly learning links for ${careerRecommendations.slice(0, 2).map((career) => career.title).join(' and ')}.`
                  : 'Resources will be tailored to the career domains you choose.'}</p>
                {resources.length > 0 ? <div className="resource-list">
                  {resources.map((resource, index) => (
                    <a
                      className="resource-item"
                      href={resource.url}
                      key={resource.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className={`resource-icon resource-icon--${index}`}><Icon name={resource.icon} size={18} /></span>
                      <span className="resource-copy"><strong>{resource.title}</strong><span>{resource.source} <i>·</i> {resource.career}</span></span>
                      <Icon name="arrow" size={16} className="resource-arrow" />
                    </a>
                  ))}
                </div> : (
                  <div className="empty-state empty-state--compact">
                    <strong>Pick your field to get started.</strong>
                    <p>We’ll suggest official guides and beginner courses that match your interests.</p>
                  </div>
                )}
                <div className="weekly-goal">
                    <div className="weekly-goal-top"><span><Icon name="spark" size={16} /> THIS WEEK’S GOAL</span><strong>{weeklyLearningHours} of 6 hrs</strong></div>
                  <ProgressBar value={Math.round((weeklyLearningHours / 6) * 100)} color="violet" />
                  <p>Estimated from completed roadmap skills. A little learning, often, goes a long way.</p>
              </div>
            </section>
          </div>

          <section className="feature-section" id="projects" aria-labelledby="projects-title">
            <div className="feature-heading">
              <div>
                <p className="section-kicker">BUILD BY DOING</p>
                <h2 id="projects-title">Project recommendations</h2>
                <p>Projects are matched to your latest assessment, goals, and selected company domains.</p>
              </div>
              <a className="text-link" href="#xp">View XP and levels <Icon name="arrow" size={14} /></a>
            </div>
            {projectsError && <div className="feature-error" role="alert">{projectsError}</div>}
            {projectsStatus === 'loading' ? (
              <div className="panel feature-empty" role="status">Loading project recommendations…</div>
            ) : projectsStatus === 'success' && projects.length === 0 ? (
              <div className="panel feature-empty">No projects are available right now.</div>
            ) : (
              <div className="project-grid">
                {projects.map((project) => (
                  <article className="panel project-card" key={project.key}>
                    <div className="project-card-top">
                      <span className={`project-difficulty project-difficulty--${project.difficulty.toLowerCase()}`}>
                        {project.difficulty}
                      </span>
                      <span className="project-domain">
                        {domains.find((domain) => domain.id === project.domain)?.label || project.domain}
                      </span>
                    </div>
                    <h3>{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    <p className="project-reason">{project.recommendationReason}</p>
                    <div className="project-meta">
                      <strong>Skills &amp; tools</strong>
                      <span>{project.skillsAndTools.join(' · ')}</span>
                    </div>
                    <div className="project-meta">
                      <strong>Expected outcome</strong>
                      <span>{project.expectedOutcome}</span>
                    </div>
                    <div className="project-progress-label">
                      <strong>{project.completed ? 'Project complete' : `${project.progressPercent}% complete`}</strong>
                      <span>{project.milestones.filter((milestone) => milestone.completed).length}/{project.milestones.length} milestones</span>
                    </div>
                    <ProgressBar value={project.progressPercent} color="blue" />
                    <div className="project-milestones">
                      <strong className="project-subheading">Learning steps</strong>
                      {project.milestones.map((milestone) => (
                        <div className={`project-milestone ${milestone.completed ? 'project-milestone--done' : ''}`} key={milestone.key}>
                          <span className="milestone-copy">
                            <strong>{milestone.title}</strong>
                            <span>{milestone.learningStep}</span>
                          </span>
                          {milestone.completed ? (
                            <span className="milestone-earned">Done · +25 XP</span>
                          ) : (
                            <button
                              className="button button--outline milestone-action"
                              type="button"
                              disabled={!project.started || projectBusyKey === `${project.key}/milestones/${milestone.key}/complete`}
                              onClick={() => mutateProject(`${project.key}/milestones/${milestone.key}/complete`)}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      className={`button ${project.started ? 'button--outline' : 'button--primary'} project-start`}
                      type="button"
                      disabled={project.started || projectBusyKey === `${project.key}/start`}
                      onClick={() => mutateProject(`${project.key}/start`)}
                    >
                      {project.completed ? 'Completed' : project.started ? 'Project started' : 'Start project'}
                    </button>
                    <p className="project-xp-note">Earn 25 XP per milestone and 100 XP when all milestones are complete.</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="feature-section" id="companies" aria-labelledby="companies-title">
            <div className="feature-heading">
              <div>
                <p className="section-kicker">PLAN YOUR TARGETS</p>
                <h2 id="companies-title">Company preferences</h2>
                <p>Choose multiple examples to tailor career and project recommendations.</p>
              </div>
            </div>
            {companyError && <div className="feature-error" role="alert">{companyError}</div>}
            <article className="panel company-panel">
              <div className="company-filters">
                <label>
                  <span>Search companies</span>
                  <input
                    type="search"
                    value={companySearch}
                    onChange={(event) => setCompanySearch(event.target.value)}
                    placeholder="Search by company name"
                  />
                </label>
                <label>
                  <span>Filter by domain</span>
                  <select value={companyDomainFilter} onChange={(event) => setCompanyDomainFilter(event.target.value)}>
                    <option value="all">All supported domains</option>
                    {domains.filter((domain) => ['ece', 'embedded', 'iot', 'vlsi', 'robotics', 'electrical', 'software', 'ai'].includes(domain.id))
                      .map((domain) => <option key={domain.id} value={domain.id}>{domain.label}</option>)}
                  </select>
                </label>
              </div>
              {companies.length === 0 ? (
                <p className="feature-empty-inline">Company options have not loaded.</p>
              ) : (
                <div className="company-options">
                  {companies.filter((company) => {
                    const matchesName = company.name.toLowerCase().includes(companySearch.trim().toLowerCase())
                    const matchesDomain = companyDomainFilter === 'all' || company.domains.includes(companyDomainFilter)
                    return matchesName && matchesDomain
                  }).map((company) => (
                    <label className="company-option" key={company.key}>
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.key)}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...selectedCompanies, company.key]
                            : selectedCompanies.filter((key) => key !== company.key)
                          updateCompanyPreferences(next)
                        }}
                      />
                      <span>
                        <strong>{company.name}</strong>
                        <small>{company.domains.map((domainId) => domains.find((domain) => domain.id === domainId)?.label || domainId).join(' · ')}</small>
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <div className="company-selected">
                <strong>Selected targets</strong>
                {selectedCompanies.length ? (
                  <div className="company-chips">
                    {selectedCompanies.map((key) => {
                      const company = companies.find((item) => item.key === key)
                      if (!company) return null
                      return (
                        <button
                          className="company-chip"
                          key={key}
                          type="button"
                          aria-label={`Remove ${company.name}`}
                          onClick={() => updateCompanyPreferences(selectedCompanies.filter((item) => item !== key))}
                        >
                          {company.name}<span aria-hidden="true"> ×</span>
                        </button>
                      )
                    })}
                  </div>
                ) : <span className="company-none">No companies selected yet.</span>}
              </div>
              <p className="company-notice">{companyNotice || 'Companies are examples only; listing is not an endorsement or a guarantee of employment.'}</p>
            </article>
          </section>

          <section className="feature-section" id="xp" aria-labelledby="xp-title">
            <div className="feature-heading">
              <div>
                <p className="section-kicker">YOUR PROJECT JOURNEY</p>
                <h2 id="xp-title">XP &amp; level up</h2>
                <p>XP rewards are based on completed project milestones and projects—not roadmap checkmarks.</p>
              </div>
            </div>
            {xpError && <div className="feature-error" role="alert">{xpError}</div>}
            {xpSummary ? (
              <>
                <div className="xp-overview">
                  <article className="panel xp-total">
                    <span className="section-kicker">TOTAL EXPERIENCE</span>
                    <strong>{xpSummary.totalXp} XP</strong>
                    <span>Level {xpSummary.level} · {xpSummary.rank}</span>
                  </article>
                  <article className="panel xp-next">
                    <div className="project-progress-label">
                      <strong>{xpSummary.level === 30 ? 'Maximum level reached' : `${xpSummary.xpToNextLevel} XP to next level`}</strong>
                      <span>{xpSummary.progressPercent}%</span>
                    </div>
                    <ProgressBar value={xpSummary.progressPercent} color="violet" />
                    <p>Levels 1–10 Beginner · 11–20 Intermediate · 21–30 Advanced</p>
                  </article>
                </div>
                <div className="xp-content-grid">
                  <article className="panel xp-badges">
                    <h3>Achievement badges</h3>
                    <div className="badge-list">
                      {xpSummary.badges.map((badge) => (
                        <div className={`achievement-badge ${badge.earned ? 'achievement-badge--earned' : ''}`} key={badge.key}>
                          <span aria-hidden="true">{badge.earned ? '✦' : '○'}</span>
                          <div><strong>{badge.title}</strong><small>{badge.description}</small></div>
                          <span className="badge-state">{badge.earned ? 'Earned' : 'Locked'}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                  <article className="panel xp-history">
                    <h3>XP reward history</h3>
                    {xpSummary.rewards.length ? (
                      <ul>
                        {xpSummary.rewards.slice(0, 10).map((reward) => (
                          <li key={reward.eventKey}>
                            <span><strong>{reward.description}</strong><small>{new Date(reward.awardedAt).toLocaleDateString()}</small></span>
                            <b>+{reward.points} XP</b>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="company-none">Complete a project milestone to earn your first XP.</p>}
                  </article>
                </div>
                <p className="xp-formula">Level threshold: 50 × level × (level − 1) cumulative XP. Level is capped at 30 (43,500 XP); each reward is recorded once per milestone or project.</p>
              </>
            ) : <div className="panel feature-empty" role="status">Loading XP and level information…</div>}
          </section>

          <section className="settings-view" id="settings" aria-labelledby="settings-title">
            <div className="settings-heading">
              <p className="section-kicker">PREFERENCES</p>
              <h2 id="settings-title">Settings</h2>
              <p>Manage how your learning progress is stored in this browser.</p>
            </div>
            <article className="panel settings-card">
              <div className="settings-card-copy">
                <span className="settings-card-icon"><Icon name="map" size={18} /></span>
                <div>
                  <h3>Roadmap progress</h3>
                  <p>
                    {completedCount} {completedCount === 1 ? 'skill' : 'skills'} marked complete.
                    This progress is saved only on this device and is not synced to an account.
                  </p>
                </div>
              </div>
              {confirmProgressReset ? (
                <div className="settings-actions" role="group" aria-label="Confirm clearing roadmap progress">
                  <span className="settings-confirmation">Clear all saved skill progress?</span>
                  <button
                    className="button button--outline"
                    type="button"
                    onClick={() => setConfirmProgressReset(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button button--danger"
                    type="button"
                    onClick={clearRoadmapProgress}
                  >
                    Clear progress
                  </button>
                </div>
              ) : (
                <button
                  className="button button--outline"
                  type="button"
                  disabled={completedCount === 0}
                  onClick={() => setConfirmProgressReset(true)}
                >
                  Clear progress
                </button>
              )}
            </article>
            <article className="panel settings-card settings-card--info">
              <div className="settings-card-copy">
                <span className="settings-card-icon settings-card-icon--green"><Icon name="check" size={18} /></span>
                <div>
                  <h3>Assessment and roadmap</h3>
                  <p>Your assessment answers, career recommendations, and selected roadmap are saved by the career service.</p>
                </div>
              </div>
              <span className="settings-status">Server-saved</span>
            </article>
          </section>

          <footer className="dashboard-footer">
            <span>Made for your next chapter <span className="footer-heart">♥</span></span>
            <span>Assessment and roadmap are server-saved; profile and dashboard statistics are sample data. Skill completion is stored on this device.</span>
          </footer>
          {storageMessage && <div className="storage-notice" role="status">{storageMessage}</div>}
        </div>
      </main>
    </div>
  )
}

export default App
