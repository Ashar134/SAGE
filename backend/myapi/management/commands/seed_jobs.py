from django.core.management.base import BaseCommand
from myapi.models import Job, Company
from django.utils import timezone
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Populates the database with sample jobs and companies'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create Companies
        companies_data = [
            {
                'name': 'Apple',
                'logo_color': '#000000',
                'logo_initial': '',
                'location': 'Cupertino, CA'
            },
            {
                'name': 'Google',
                'logo_color': '#4285f4',
                'logo_initial': 'G',
                'location': 'Mountain View, CA'
            },
            {
                'name': 'Meta',
                'logo_color': '#0668E1',
                'logo_initial': 'M',
                'location': 'Menlo Park, CA'
            },
            {
                'name': 'Netflix',
                'logo_color': '#E50914',
                'logo_initial': 'N',
                'location': 'Los Gatos, CA'
            },
            {
                'name': 'Airbnb',
                'logo_color': '#FF5A5F',
                'logo_initial': 'A',
                'location': 'San Francisco, CA'
            },
            {
                'name': 'Spotify',
                'logo_color': '#1DB954',
                'logo_initial': 'S',
                'location': 'New York, NY'
            },
            {
                'name': 'Microsoft',
                'logo_color': '#00A4EF',
                'logo_initial': 'M',
                'location': 'Redmond, WA'
            },
            {
                'name': 'Amazon',
                'logo_color': '#FF9900',
                'logo_initial': 'A',
                'location': 'Seattle, WA'
            }
        ]

        companies = {}
        for c_data in companies_data:
            company, created = Company.objects.get_or_create(
                name=c_data['name'],
                defaults={
                    'logo_color': c_data['logo_color'],
                    'logo_initial': c_data['logo_initial'],
                    'description': f"Leading technology company based in {c_data['location']}."
                }
            )
            companies[c_data['name']] = company
            if created:
                self.stdout.write(f"Created company: {company.name}")

        # 2. Create Jobs - Professional HR Language, Keyword-Optimized
        jobs_data = [
            {
                'title': 'Human Interface Designer',
                'company': 'Apple',
                'location': 'Cupertino, California',
                'description': 'Do you dream of designing products that touch billions of lives? Apple is seeking a visionary Human Interface Designer to shape the future of how people interact with technology. Join our legendary design team at Apple Park, where you\'ll craft the visual language for iOS, macOS, watchOS, and visionOS platforms. You\'ll collaborate with the world\'s most talented engineers and designers in an environment where innovation is celebrated and excellence is the standard. If you\'re passionate about creating interfaces that feel magical and intuitive, we want to meet you.',
                'job_type': ['Full-Time', 'On-site'],
                'salary_min': 200000,
                'salary_max': 350000,
                'is_remote': False,
                'days_ago': 0,
                'requirements': [
                    'Proficiency in Figma for UI design, prototyping, and design system management',
                    'Expert-level skills in Sketch for interface design and asset creation',
                    'Strong command of Adobe Creative Suite (Photoshop, Illustrator, After Effects)',
                    'Deep understanding of Apple Human Interface Guidelines (HIG) and platform conventions',
                    'Hands-on experience with prototyping tools including Principle, Framer, and ProtoPie',
                    'Solid foundation in motion design principles and micro-interaction patterns',
                    'Working knowledge of accessibility standards (WCAG 2.1) and inclusive design',
                    'Experience building and maintaining scalable design systems',
                    'Familiarity with SwiftUI design patterns and developer handoff workflows',
                    'Strong typography, color theory, and visual hierarchy skills',
                    'Bachelor\'s or Master\'s degree in Design, Human-Computer Interaction, or related field',
                    '5+ years of professional experience in UI/UX design with a compelling portfolio'
                ],
                'responsibilities': [
                    'Lead the design of intuitive, delightful user interfaces for iOS, macOS, watchOS, and the revolutionary visionOS spatial computing platform',
                    'Create comprehensive wireframes, interactive prototypes, and pixel-perfect high-fidelity mockups using Figma and Sketch',
                    'Architect and evolve design systems with reusable components that ensure consistency across Apple\'s product ecosystem',
                    'Partner closely with engineering teams to ensure design intent is faithfully translated into shipped products',
                    'Conduct user research studies and usability testing sessions to validate design hypotheses and iterate based on insights',
                    'Develop motion design specifications and micro-interaction patterns that bring interfaces to life',
                    'Present design concepts to senior leadership and cross-functional stakeholders, articulating rationale with clarity and confidence',
                    'Mentor junior designers, fostering growth and contributing to Apple\'s world-class design culture'
                ],
                'benefits': [
                    'Comprehensive Health Coverage: Premium medical, dental, and vision insurance for you and your dependents',
                    'Employee Stock Purchase Plan: 15% discount on Apple shares to invest in the company you\'re building',
                    'Retirement Security: Generous 401(k) matching up to 6% of your salary',
                    'Performance Recognition: Annual bonus tied to company performance and individual contributions',
                    'Wellness Investment: $500 annual reimbursement for fitness, mindfulness, and self-care',
                    'Continuous Learning: Up to $5,250 yearly for education, certifications, and professional development',
                    'Family First: 16 weeks of paid parental leave to welcome new additions to your family',
                    'Apple Perks: Significant employee discounts and access to products before public release'
                ],
                'selection_process': [
                    'Portfolio Review: Our design leadership carefully evaluates your portfolio and case studies (typically 1 week)',
                    'Recruiter Conversation: A 30-minute introductory call to discuss your background and answer your questions about life at Apple',
                    'Design Challenge: A take-home design exercise that lets you showcase your creative problem-solving (3-5 days)',
                    'Design Team Interviews: Three rounds of in-depth conversations with design leads and cross-functional partners',
                    'Onsite Experience: A full-day immersive interview loop at Apple Park with your potential team',
                    'Offer Decision: If we\'re mutually excited, expect an offer within one week of your final interview'
                ]
            },
            {
                'title': 'Frontend Developer',
                'company': 'Google',
                'location': 'Mountain View, California',
                'description': 'Ready to build products used by billions? Google is looking for a Frontend Developer who\'s passionate about crafting exceptional web experiences. You\'ll join a team of world-class engineers working on Google\'s flagship products, where your code will directly impact how people search, communicate, and navigate the digital world. We value technical excellence, user-centric thinking, and the curiosity to push boundaries. Whether you\'re optimizing Core Web Vitals or building accessible interfaces, you\'ll have the resources and support to do your best work. Come help us organize the world\'s information and make it universally accessible.',
                'job_type': ['Full-time', 'Remote'],
                'salary_min': 210000,
                'salary_max': 340000,
                'is_remote': True,
                'days_ago': 0,
                'requirements': [
                    'Strong proficiency in JavaScript (ES6+) with deep understanding of language fundamentals',
                    'Expert-level TypeScript skills for building type-safe, maintainable applications',
                    'Extensive hands-on experience with React.js and its ecosystem',
                    'Production experience with Next.js for server-side rendering and static site generation',
                    'Strong command of HTML5 semantic markup and accessibility best practices',
                    'Advanced CSS3 skills including Flexbox, CSS Grid, and responsive design patterns',
                    'Experience with state management solutions (Redux, Zustand, React Context API)',
                    'Proficiency integrating with REST APIs and GraphQL endpoints',
                    'Hands-on experience with modern build tools (Webpack, Vite, Babel, esbuild)',
                    'Deep understanding of cross-browser compatibility and progressive enhancement',
                    'Strong testing discipline with Jest, React Testing Library, and Cypress',
                    'Proficiency with Git version control and collaborative development workflows',
                    'Experience with CI/CD pipelines using GitHub Actions, Jenkins, or Cloud Build',
                    'Knowledge of web performance optimization techniques and Core Web Vitals',
                    'Understanding of WCAG 2.1 accessibility standards and ARIA implementation',
                    'Bachelor\'s degree in Computer Science or equivalent practical experience'
                ],
                'responsibilities': [
                    'Architect and build scalable, performant web applications using React.js and TypeScript that serve billions of users worldwide',
                    'Implement responsive, mobile-first user interfaces with modern CSS techniques and thoughtful attention to detail',
                    'Integrate frontend applications seamlessly with REST APIs and GraphQL services',
                    'Lead performance optimization initiatives, improving Core Web Vitals and overall user experience metrics',
                    'Write comprehensive unit, integration, and end-to-end tests to ensure reliability at scale',
                    'Collaborate closely with UX designers and researchers to translate designs into polished, accessible interfaces',
                    'Participate actively in code reviews, mentoring teammates and maintaining high engineering standards',
                    'Contribute to frontend architecture decisions and technical documentation for growing teams'
                ],
                'benefits': [
                    'Work From Anywhere: Flexible remote policy that lets you do your best work from wherever you thrive',
                    'Competitive Compensation: Top-of-market base salary with substantial annual performance bonuses',
                    'Equity Ownership: Restricted Stock Units (RSUs) vesting over 4 years so you share in Google\'s success',
                    'Comprehensive Healthcare: Premium medical, dental, and vision coverage for you and your family',
                    'Wellness Resources: On-site fitness centers, wellness programs, and mental health support',
                    'Family Support: 18 weeks of fully paid parental leave for all new parents',
                    'Growth Investment: $10,000 annual learning budget for conferences, courses, and skill development',
                    'Google Perks: Free gourmet meals, snacks, and world-class office amenities'
                ],
                'selection_process': [
                    'Application Review: Our recruiting team reviews your resume and materials (typically 1 week)',
                    'Technical Phone Screen: A 45-minute coding interview with a Google engineer to assess fundamentals',
                    'Online Assessment: A timed coding challenge focusing on algorithms and problem-solving',
                    'Virtual Onsite Loop: 4-5 comprehensive interviews covering data structures, system design, and frontend expertise',
                    'Hiring Committee: All interview feedback is reviewed by an independent committee for fair, thorough evaluation',
                    'Offer Stage: Successful candidates receive offers within 2 weeks of completing the interview process'
                ]
            },
            {
                'title': 'Senior UX Designer',
                'company': 'Meta',
                'location': 'Menlo Park, California',
                'description': 'Are you ready to design the future of human connection? Meta is seeking a Senior UX Designer to lead transformative experiences across the Metaverse and our family of apps serving over 3 billion people. You\'ll pioneer immersive VR/AR experiences for Quest, shape social interactions on Instagram and WhatsApp, and help build the next computing platform. We\'re looking for a design leader who combines strategic vision with hands-on craft, thrives in ambiguity, and is passionate about bringing people closer together through technology. If you want to define how humanity connects in the digital age, this is your opportunity.',
                'job_type': ['Full-time', 'Hybrid'],
                'salary_min': 225000,
                'salary_max': 350000,
                'is_remote': False,
                'days_ago': 0,
                'requirements': [
                    'Expert proficiency in Figma for UX design, prototyping, and design system management',
                    'Hands-on experience with VR/AR design tools including Unity, Spark AR, and ShapesXR',
                    'Strong foundation in 3D design principles, spatial computing, and immersive interface patterns',
                    'Proficiency with advanced prototyping tools (Principle, ProtoPie, Origami Studio)',
                    'Deep expertise in user research methodologies including interviews, usability testing, and A/B experimentation',
                    'Experience building and scaling design systems across large product organizations',
                    'Knowledge of accessibility standards for immersive and traditional digital experiences',
                    'Understanding of emerging interaction patterns including gesture, voice, and eye-tracking',
                    'Strong mobile design skills for iOS and Android platforms',
                    'Excellent information architecture and interaction design capabilities',
                    'Bachelor\'s or Master\'s degree in Design, Human-Computer Interaction, or related field',
                    '7+ years of progressive experience in UX design with demonstrated leadership'
                ],
                'responsibilities': [
                    'Lead UX design strategy for Meta\'s VR/AR products including Quest headsets and Ray-Ban Meta smart glasses',
                    'Define the user experience vision for immersive social platforms that connect people in entirely new ways',
                    'Conduct and synthesize user research to deeply understand the needs of diverse, global user populations',
                    'Create comprehensive user flows, wireframes, and interactive prototypes for novel spatial computing interfaces',
                    'Partner with engineering and product leadership to ship high-quality experiences that meet ambitious timelines',
                    'Champion accessibility and inclusive design principles across all platforms and experiences',
                    'Mentor and develop junior designers, building a culture of design excellence and continuous growth',
                    'Present design vision and rationale to executive leadership, influencing product direction at the highest levels'
                ],
                'benefits': [
                    'Industry-Leading Compensation: Highly competitive salary plus RSUs and annual performance bonuses',
                    'Flexible Work: Hybrid model with 3 days in our beautiful Menlo Park campus and 2 days remote',
                    'Family Planning: Premium health benefits including comprehensive fertility and family-building support',
                    'Cutting-Edge Access: Early access to Meta Reality Labs prototypes and the latest VR/AR hardware',
                    'Mental Wellness: Comprehensive mental health resources, therapy benefits, and wellness programs',
                    'Generous Time Off: Unlimited PTO policy with company-wide recharge days throughout the year',
                    'Career Growth: Paid sabbatical program after 5 years to pursue personal projects or recharge',
                    'Family Support: On-site childcare, backup care services, and generous family leave policies'
                ],
                'selection_process': [
                    'Portfolio Evaluation: Our UX leadership carefully reviews your design portfolio and case studies (1 week)',
                    'Recruiter Introduction: A 30-minute conversation to discuss your experience and share what makes Meta special',
                    'Design Exercise: An app critique or focused design challenge to showcase your thinking process (1 week)',
                    'Design Team Loop: 4 in-depth interviews with senior designers, product managers, and design leadership',
                    'Cross-Functional Interviews: Conversations with engineering and research partners to assess collaboration skills',
                    'Offer Decision: Strong candidates receive offers within 1-2 weeks of completing the interview process'
                ]
            },
            {
                'title': 'UI/UX Designer',
                'company': 'Netflix',
                'location': 'Los Gatos, California',
                'description': 'Want to design experiences that bring joy to 250 million people worldwide? Netflix is looking for a talented UI/UX Designer to revolutionize how audiences discover and enjoy entertainment. You\'ll work on interfaces across web, mobile, gaming consoles, and smart TVs, crafting the moments that make finding your next favorite show feel magical. Our design team operates with unusual freedom and responsibility, where your ideas can ship quickly and your impact is immediately visible. If you\'re passionate about entertainment, obsessive about craft, and ready to design at unprecedented scale, we should talk.',
                'job_type': ['Full-time', 'On-site'],
                'salary_min': 200000,
                'salary_max': 320000,
                'is_remote': False,
                'days_ago': 0,
                'requirements': [
                    'Expert proficiency in Figma for UI/UX design, prototyping, and component systems',
                    'Strong Adobe After Effects skills for motion design, animations, and interaction specifications',
                    'Experience with Principle, Framer, or similar tools for creating interactive prototypes',
                    'Exceptional visual design skills including typography, color theory, and compositional hierarchy',
                    'Specialized experience designing for TV/10-foot interfaces and living room experiences',
                    'Deep understanding of motion design principles and their role in user experience',
                    'Proven ability to design responsive experiences across web, mobile, tablet, and TV platforms',
                    'Experience with A/B testing, experimentation frameworks, and data-informed design decisions',
                    'Familiarity with design systems, component libraries, and design tokens',
                    'Understanding of WCAG 2.1 accessibility standards and inclusive design practices',
                    'Bachelor\'s degree in Design, Visual Arts, Human-Computer Interaction, or related field',
                    '4+ years of professional UI/UX design experience with a strong portfolio'
                ],
                'responsibilities': [
                    'Design intuitive, beautiful user interfaces across the Netflix ecosystem including web, iOS, Android, gaming consoles, and smart TVs',
                    'Create compelling visual designs that enhance content discovery and make browsing feel effortless and enjoyable',
                    'Develop sophisticated motion design and micro-interactions that bring personality to the Netflix experience',
                    'Partner with data science and product teams to design and evaluate A/B tests that drive engagement and satisfaction',
                    'Contribute to Netflix\'s design system, creating reusable components and patterns used across all platforms',
                    'Collaborate closely with engineers to ensure designs are implemented with fidelity and performance',
                    'Present design concepts to stakeholders at all levels, incorporating feedback into iterative improvements',
                    'Stay current with emerging design trends, technologies, and entertainment industry innovations'
                ],
                'benefits': [
                    'Freedom & Responsibility: Unlimited PTO policy because we trust you to manage your time and recharge when needed',
                    'Top-of-Market Pay: Competitive salary reviewed annually against market data to ensure you\'re always fairly compensated',
                    'Equity Participation: Stock options with a competitive vesting schedule so you share in Netflix\'s success',
                    'Premium Healthcare: 100% coverage of medical, dental, and vision premiums for you and your dependents',
                    'Netflix Forever: Free Netflix subscription for you and your household - enjoy the entertainment you\'re helping create!',
                    'Home Office Setup: $1,000 allowance to create your ideal workspace when working from home',
                    'Wellness Support: $100 monthly stipend for gym memberships, wellness apps, or self-care activities',
                    'Industry-Leading Parental Leave: Up to 52 weeks of paid leave to bond with your new child'
                ],
                'selection_process': [
                    'Application Review: Our design team reviews your portfolio and application materials (typically 1 week)',
                    'Recruiter Conversation: A 30-minute call to learn about your background and discuss the opportunity',
                    'Design Challenge: A take-home exercise focused on a Netflix-relevant design problem to showcase your process',
                    'Portfolio Presentation: Present your challenge solution and walk through case studies with the design panel',
                    'Onsite Interviews: A full-day of conversations with designers, product managers, and cross-functional partners',
                    'Offer Decision: Strong candidates receive offers within 1 week of completing the interview loop'
                ]
            },
            {
                'title': 'Fullstack Engineer',
                'company': 'Airbnb',
                'location': 'San Francisco, California',
                'description': 'Do you believe technology can help people belong anywhere? Airbnb is seeking a talented Fullstack Engineer to build the platform that connects millions of travelers with unique stays and experiences worldwide. You\'ll work across our entire stack - from React frontends to Ruby on Rails and Node.js backends - in a collaborative environment that values craft, impact, and belonging. Our engineering culture emphasizes ownership, where you\'ll ship features end-to-end and see your work used by guests and hosts around the globe. If you want to build products that foster human connection and make travel more accessible, we\'d love to hear from you.',
                'job_type': ['Full-time', 'Remote'],
                'salary_min': 240000,
                'salary_max': 350000,
                'is_remote': True,
                'days_ago': 0,
                'requirements': [
                    'Strong proficiency in JavaScript (ES6+) with deep understanding of modern language features',
                    'Expert TypeScript skills for building robust, type-safe applications',
                    'Extensive experience with React.js and Next.js for building dynamic web applications',
                    'Solid backend experience with Node.js and Express.js for API development',
                    'Production experience with Ruby on Rails for full-stack applications',
                    'Strong command of HTML5, CSS3, and responsive design principles',
                    'Proven expertise in PostgreSQL including schema design and query optimization',
                    'Hands-on experience with Redis for caching, session management, and real-time features',
                    'Proficiency building and consuming REST APIs and GraphQL services',
                    'Understanding of microservices architecture patterns and distributed systems',
                    'Experience with Docker containerization and Kubernetes orchestration',
                    'Working knowledge of AWS services (EC2, S3, RDS, Lambda, CloudFront)',
                    'Strong testing discipline with frameworks like Jest, RSpec, and Cypress',
                    'Proficiency with Git and collaborative development workflows',
                    'Experience with CI/CD pipelines using CircleCI, GitHub Actions, or similar',
                    'Bachelor\'s degree in Computer Science or equivalent practical experience'
                ],
                'responsibilities': [
                    'Build complete features end-to-end, from React frontend interfaces to Rails/Node.js backend services',
                    'Design and implement robust RESTful APIs and GraphQL endpoints that power web and mobile applications',
                    'Optimize database performance through query tuning, indexing strategies, and caching layer improvements',
                    'Write comprehensive test suites including unit, integration, and end-to-end tests to ensure reliability',
                    'Collaborate with product managers, designers, and data scientists to define requirements and deliver solutions',
                    'Participate in thorough code reviews, providing constructive feedback and maintaining engineering standards',
                    'Contribute to system architecture decisions, technical planning, and platform evolution',
                    'Mentor junior engineers, sharing knowledge and fostering a culture of continuous learning'
                ],
                'benefits': [
                    'Live & Work Anywhere: Our flexible remote policy means you can do your best work from wherever you call home',
                    'Travel Credits: $2,000 annual Airbnb travel credit to explore the world using the platform you\'re building',
                    'Comprehensive Healthcare: Premium medical, dental, and vision coverage for you and your family',
                    'Equity Ownership: Competitive stock options with 4-year vesting so you share in Airbnb\'s growth',
                    'Generous Parental Leave: 22 weeks of fully paid leave for all new parents',
                    'Learning Budget: $2,000 annual stipend for courses, conferences, and professional development',
                    'Home Office Support: $500 to set up your ideal remote work environment',
                    'Wellness Benefits: $100 monthly allowance for fitness, mental health, and self-care'
                ],
                'selection_process': [
                    'Resume Review: Our engineering team evaluates your background and experience (typically 1 week)',
                    'Recruiter Call: A 30-minute conversation to discuss your experience and answer questions about Airbnb',
                    'Technical Screen: A 60-minute coding interview focusing on data structures and problem-solving',
                    'System Design: A 60-minute architecture discussion exploring how you approach complex technical challenges',
                    'Virtual Onsite: 4-5 comprehensive interviews covering frontend, backend, and behavioral competencies',
                    'Offer Decision: Strong candidates receive offers within 1 week of completing the interview loop'
                ]
            },
            {
                'title': 'Data Engineer',
                'company': 'Spotify',
                'location': 'New York, New York',
                'description': 'Ready to power the algorithms that help 500 million people discover music they love? Spotify is seeking a Data Engineer to build and scale the data infrastructure behind the world\'s most popular audio streaming platform. You\'ll design ETL pipelines, architect data warehouses, and enable the machine learning systems that create personalized experiences for listeners worldwide. Our data engineering team works at the intersection of massive scale and real-time processing, handling petabytes of data daily. If you\'re passionate about data, music, and building systems that work at unprecedented scale, let\'s talk.',
                'job_type': ['Full-time', 'Hybrid'],
                'salary_min': 215000,
                'salary_max': 335000,
                'is_remote': False,
                'days_ago': 0,
                'requirements': [
                    'Strong proficiency in Python for data engineering, including libraries like pandas, numpy, and PyArrow',
                    'Expert-level SQL skills including complex query optimization and performance tuning',
                    'Extensive experience with Apache Spark and PySpark for distributed data processing',
                    'Hands-on experience with Apache Kafka for real-time streaming and event-driven architectures',
                    'Proficiency with Apache Airflow for workflow orchestration and pipeline scheduling',
                    'Production experience with cloud data warehouses (Snowflake, BigQuery, or Redshift)',
                    'Strong understanding of ETL/ELT pipeline design patterns and data integration strategies',
                    'Working knowledge of cloud platforms (GCP preferred, AWS or Azure valuable)',
                    'Solid foundation in data modeling, dimensional modeling, and schema design',
                    'Experience with dbt for data transformation and analytics engineering',
                    'Familiarity with Docker and Kubernetes for containerized data workloads',
                    'Understanding of data quality frameworks, monitoring, and observability',
                    'Knowledge of GDPR, data privacy regulations, and data governance best practices',
                    'Proficiency with Git and version control for data pipeline code',
                    'Bachelor\'s degree in Computer Science, Data Science, Statistics, or related field'
                ],
                'responsibilities': [
                    'Design and build highly scalable ETL/ELT pipelines using Airflow and Spark that process billions of events daily',
                    'Architect and maintain data warehouse infrastructure on Snowflake/BigQuery supporting analytics and ML workloads',
                    'Implement real-time data streaming solutions using Kafka for time-sensitive personalization features',
                    'Optimize SQL queries and data pipeline performance to meet strict SLAs and efficiency targets',
                    'Create robust data models and schemas that enable self-service analytics and machine learning',
                    'Build comprehensive data quality monitoring, alerting, and observability systems',
                    'Collaborate with data scientists and ML engineers to productionize models at scale',
                    'Document data pipelines thoroughly and maintain data catalogs for organizational discoverability'
                ],
                'benefits': [
                    'Flexible Hybrid Work: 2-3 days in our beautiful Manhattan office with flexibility to work remotely',
                    'Premium Spotify: Free premium subscription plus exclusive access to artist events and listening sessions',
                    'Comprehensive Wellness: Premium health coverage including mental health resources and wellness programs',
                    'Competitive Pay: Top-of-market salary with annual performance bonuses tied to impact',
                    'Equity Package: RSUs with 4-year vesting schedule so you benefit from Spotify\'s continued success',
                    'Manhattan Headquarters: Modern office space in the heart of NYC with all the amenities',
                    'Sabbatical Program: Extended paid leave after 5 years to pursue personal passions or recharge',
                    'Learning Investment: $3,000 annual budget for courses, conferences, and skill development'
                ],
                'selection_process': [
                    'Application Review: Our data engineering team reviews your resume and background (typically 1 week)',
                    'Recruiter Call: A 30-minute conversation to discuss your experience and learn about Spotify\'s data culture',
                    'Technical Screen: A 60-minute assessment covering SQL, Python, and data engineering concepts',
                    'System Design: A collaborative discussion about data pipeline architecture and trade-offs',
                    'Virtual Onsite: 4 interviews covering hands-on data engineering, system design, and behavioral competencies',
                    'Offer Decision: Successful candidates receive offers within 1-2 weeks of completing interviews'
                ]
            },
            {
                'title': 'Django/Python Developer',
                'company': 'Netflix',
                'location': 'Los Gatos, California',
                'description': 'Are you passionate about building technology that entertains the world? Netflix is looking for a talented Django/Python Developer to join our Platform Engineering team. In this role, you will architect and develop the backend systems that power content delivery to over 200 million subscribers globally. You\'ll work alongside world-class engineers in a culture that values freedom, responsibility, and innovation. If you thrive in a fast-paced environment and want to make an impact at scale, we\'d love to hear from you.',
                'job_type': ['Full-time', 'Hybrid'],
                'salary_min': 230000,
                'salary_max': 350000,
                'is_remote': False,
                'days_ago': 0,
                'requirements': [
                    'Strong proficiency in Python 3.x with 4+ years of hands-on experience',
                    'Extensive experience with Django and Django REST Framework (DRF)',
                    'Solid understanding of FastAPI or Flask for microservices development',
                    'Proven expertise in PostgreSQL including query optimization and indexing strategies',
                    'Hands-on experience with Redis for caching, session management, and rate limiting',
                    'Proficiency in Celery for distributed task queues and background job processing',
                    'Deep knowledge of RESTful API design principles and best practices',
                    'Familiarity with GraphQL and modern API gateway patterns',
                    'Experience with Docker containerization and Kubernetes orchestration',
                    'Working knowledge of AWS services (EC2, S3, RDS, Lambda, SQS, ElastiCache)',
                    'Strong testing discipline with pytest and unittest frameworks',
                    'Understanding of ORM performance optimization and N+1 query prevention',
                    'Proficiency with Git version control and collaborative development workflows',
                    'Experience with CI/CD pipelines using Jenkins, GitHub Actions, or similar tools',
                    'Solid grasp of microservices architecture and distributed systems concepts',
                    'Bachelor\'s degree in Computer Science, Software Engineering, or equivalent practical experience'
                ],
                'responsibilities': [
                    'Architect, design, and implement highly scalable backend services using Django and Django REST Framework that serve millions of daily active users',
                    'Lead the development of RESTful APIs consumed by web, mobile, and smart TV applications across the Netflix ecosystem',
                    'Drive performance optimization initiatives including database query tuning, Redis caching strategies, and API response time improvements',
                    'Build and maintain robust asynchronous task processing systems using Celery to handle complex background workflows',
                    'Champion engineering excellence by writing comprehensive unit, integration, and end-to-end tests achieving high code coverage',
                    'Partner closely with frontend engineers, product managers, and UX designers to define API contracts and deliver seamless user experiences',
                    'Conduct thorough code reviews, mentor junior developers, and contribute to a culture of continuous learning and improvement',
                    'Create and maintain comprehensive API documentation using OpenAPI/Swagger specifications and developer guides'
                ],
                'benefits': [
                    'Unlimited PTO Policy: We encourage you to take time to recharge - your well-being matters to us',
                    'Top-of-Market Compensation: Competitive salary reviewed annually against market data to ensure you\'re always fairly paid',
                    'Equity Participation: Stock options that let you share in Netflix\'s success with a competitive 4-year vesting schedule',
                    'Premium Healthcare: 100% coverage of medical, dental, and vision premiums for you and your entire family',
                    'Free Netflix for Life: Enjoy unlimited streaming for you and your loved ones - on us!',
                    'Home Office Allowance: $1,000 to set up your ideal work-from-home environment',
                    'Wellness Benefits: $100 monthly stipend for gym memberships, mental health apps, or self-care activities',
                    'Industry-Leading Parental Leave: Up to 52 weeks of paid leave for new parents to bond with their little ones'
                ],
                'selection_process': [
                    'Application Review: Our engineering team carefully reviews your resume and portfolio (typically 5-7 business days)',
                    'Introductory Call: A friendly 30-minute conversation with our recruiter to learn about your background and answer your questions',
                    'Technical Assessment: A 60-minute live coding session focused on Python/Django problem-solving with one of our senior engineers',
                    'System Design Discussion: A collaborative 45-minute session exploring backend architecture challenges relevant to Netflix scale',
                    'Virtual Onsite: A comprehensive half-day of 4-5 interviews covering technical depth, system design, and culture fit with your potential teammates',
                    'Offer Stage: If there\'s a mutual fit, we move quickly - expect a decision within 5 business days of your final interview'
                ]
            },
            {
                'title': 'Frontend Engineer',
                'company': 'Microsoft',
                'location': 'Redmond, Washington',
                'description': 'Want to build enterprise software used by millions of businesses worldwide? Microsoft is seeking a Frontend Engineer to create powerful, accessible web applications for Azure cloud services. You\'ll join a team that\'s redefining how enterprises manage their cloud infrastructure, building interfaces that balance sophisticated functionality with intuitive design. Our engineering culture emphasizes growth mindset, customer obsession, and technical excellence. If you\'re passionate about React, TypeScript, and building software that empowers organizations to achieve more, we want you on our team.',
                'job_type': ['Full-time', 'Hybrid'],
                'salary_min': 220000,
                'salary_max': 345000,
                'is_remote': False,
                'days_ago': 0,
                'requirements': [
                    'Strong proficiency in JavaScript (ES6+) with comprehensive understanding of language internals',
                    'Expert-level TypeScript skills for building enterprise-grade, type-safe applications',
                    'Extensive hands-on experience with React.js and modern component patterns',
                    'Production experience with Next.js, Remix, or similar meta-frameworks',
                    'Strong command of HTML5 semantic markup and accessibility-first development',
                    'Advanced CSS3 skills including Flexbox, CSS Grid, and CSS-in-JS solutions',
                    'Experience with state management libraries (Redux, MobX, Recoil, Zustand)',
                    'Proficiency consuming REST APIs and GraphQL services',
                    'Hands-on experience with modern build tooling (Webpack, Vite, esbuild, SWC)',
                    'Strong testing practice with Jest, Playwright, and Cypress',
                    'Proficiency with Git, GitHub, and Azure DevOps workflows',
                    'Deep knowledge of web accessibility standards (WCAG 2.1, ARIA patterns)',
                    'Familiarity with Azure cloud services (Azure Functions, CDN, App Service)',
                    'Understanding of web performance optimization and monitoring',
                    'Bachelor\'s degree in Computer Science or equivalent practical experience',
                    '5+ years of professional frontend development experience'
                ],
                'responsibilities': [
                    'Build scalable, enterprise-grade web applications using React and TypeScript that power Azure\'s cloud management experience',
                    'Implement responsive, fully accessible user interfaces following WCAG guidelines and Microsoft\'s inclusive design principles',
                    'Integrate frontend applications with Azure backend services, APIs, and real-time data streams',
                    'Drive performance optimization initiatives, improving Core Web Vitals and application responsiveness',
                    'Write comprehensive unit and end-to-end tests using Jest and Playwright to ensure reliability at enterprise scale',
                    'Participate actively in code reviews, providing thoughtful feedback and maintaining high engineering standards',
                    'Contribute to frontend architecture decisions, technical roadmaps, and platform documentation',
                    'Collaborate closely with UX designers and researchers to implement polished, user-centered interfaces'
                ],
                'benefits': [
                    'Flexible Hybrid Work: Balance in-office collaboration with remote flexibility that works for your life',
                    'Competitive Compensation: Strong base salary with annual stock awards and performance bonuses',
                    'Comprehensive Benefits: Premium medical, dental, vision, and life insurance coverage',
                    'Employee Stock Purchase: 15% discount on Microsoft shares through our ESPP program',
                    'Retirement Security: 401(k) matching up to 6% of your salary',
                    'Continuous Learning: Full access to LinkedIn Learning plus tuition reimbursement for degrees and certifications',
                    'Parental Leave: 20 weeks of fully paid leave for new parents',
                    'Wellness Investment: $1,200 annual reimbursement for fitness, wellness, and self-care'
                ],
                'selection_process': [
                    'Application Review: Our hiring team evaluates your resume and experience (typically 1 week)',
                    'Recruiter Conversation: A 30-minute call to discuss your background and answer questions about Microsoft',
                    'Technical Screen: A 60-minute coding interview focusing on JavaScript, React, and frontend fundamentals',
                    'Virtual Onsite: 4-5 comprehensive interviews covering coding challenges, system design, and behavioral competencies',
                    'Hiring Manager Discussion: A final conversation with your potential manager to discuss team fit and growth opportunities',
                    'Offer Decision: Successful candidates receive offers within 1-2 weeks of completing the interview loop'
                ]
            },
            {
                'title': 'Backend Developer',
                'company': 'Amazon',
                'location': 'Seattle, Washington',
                'description': 'Ready to build infrastructure that powers the modern internet? Amazon is seeking a Backend Developer to design and implement the distributed systems behind AWS, the world\'s most comprehensive and broadly adopted cloud platform. You\'ll work on services that handle millions of requests per second, with the autonomy to own features end-to-end and the support of world-class engineering talent. Our culture is built on customer obsession, ownership, and a bias for action. If you thrive on solving hard problems at unprecedented scale and want to shape how the world builds in the cloud, this is your opportunity.',
                'job_type': ['Full-time', 'On-site'],
                'salary_min': 250000,
                'salary_max': 350000,
                'is_remote': False,
                'days_ago': 0,
                'requirements': [
                    'Strong proficiency in Java with deep understanding of JVM performance and optimization',
                    'Solid experience with Python or Go for service development and automation',
                    'Extensive experience with Spring Boot or Spring Framework for enterprise Java development',
                    'Deep understanding of distributed systems, microservices architecture, and CAP theorem trade-offs',
                    'Proven experience designing and implementing RESTful APIs at scale',
                    'Strong hands-on experience with AWS services (EC2, Lambda, DynamoDB, S3, SQS, SNS, Kinesis)',
                    'Expertise in relational databases (PostgreSQL, MySQL) including query optimization',
                    'Production experience with NoSQL databases (DynamoDB, Redis, MongoDB) and appropriate use cases',
                    'Hands-on experience with message queues and event-driven architectures (Kafka, RabbitMQ, SQS)',
                    'Proficiency with Docker and container orchestration (ECS, Kubernetes)',
                    'Understanding of CI/CD pipelines (AWS CodePipeline, Jenkins, GitHub Actions)',
                    'Experience with monitoring, alerting, and observability tools (CloudWatch, Datadog, X-Ray)',
                    'Knowledge of infrastructure as code (Terraform, CloudFormation, CDK)',
                    'Proficiency with Git and large-scale collaborative development',
                    'Bachelor\'s or Master\'s degree in Computer Science or related technical field',
                    '5+ years of backend development experience with increasing scope and impact'
                ],
                'responsibilities': [
                    'Design and implement highly available, fault-tolerant backend services that power critical AWS infrastructure',
                    'Build and maintain RESTful APIs serving millions of customers with strict latency and reliability requirements',
                    'Optimize system performance to handle millions of requests per second with p99 latency targets',
                    'Architect microservices using Java/Spring Boot and deploy them on AWS with full CI/CD automation',
                    'Design database schemas and optimize queries for high-throughput, low-latency systems',
                    'Participate in on-call rotations, responding to operational issues and maintaining 99.99% uptime SLAs',
                    'Collaborate with cross-functional teams including product, security, and other engineering groups',
                    'Mentor junior engineers, influence team technical direction, and raise the engineering bar'
                ],
                'benefits': [
                    'Industry-Leading Compensation: Highly competitive salary with significant signing bonus for exceptional candidates',
                    'Equity Ownership: Substantial RSU package with 4-year vesting to share in Amazon\'s continued growth',
                    'Relocation Support: Comprehensive relocation package for candidates moving to Seattle',
                    'Day-One Benefits: Full medical, dental, and vision coverage effective from your first day',
                    'Employee Discounts: 10% discount on Amazon.com purchases and special employee-only deals',
                    'Cloud Credits: AWS credits for personal projects and experimentation',
                    'Career Mobility: Opportunities to grow across Amazon\'s diverse business units and technical domains',
                    'Continuous Learning: Access to internal tech talks, training programs, and industry conferences'
                ],
                'selection_process': [
                    'Resume Review: Our hiring team evaluates your technical background and experience (typically 1 week)',
                    'Online Assessment: Two coding challenges testing algorithmic thinking and problem-solving (90 minutes)',
                    'Phone Screen: A 60-minute technical interview with an Amazon engineer covering coding and system design',
                    'Virtual Onsite Loop: 5 comprehensive interviews covering coding, system design, and Amazon\'s Leadership Principles',
                    'Bar Raiser Interview: A calibrated interview by a specially trained engineer to ensure Amazon\'s hiring bar',
                    'Offer Decision: Successful candidates receive offers within 5 business days of completing the loop'
                ]
            }
        ]

        for job_data in jobs_data:
            company = companies[job_data['company']]
            posted_date = timezone.now() - timezone.timedelta(days=job_data['days_ago'])
            
            job, created = Job.objects.get_or_create(
                title=job_data['title'],
                company=company,
                defaults={
                    'company_name': company.name,
                    'location': job_data['location'],
                    'description': job_data['description'],
                    'job_type': job_data['job_type'],
                    'salary_min': job_data['salary_min'],
                    'salary_max': job_data['salary_max'],
                    'is_remote': job_data['is_remote'],
                    'posted_date': posted_date,
                    'requirements': job_data.get('requirements', []),
                    'responsibilities': job_data.get('responsibilities', []),
                    'benefits': job_data.get('benefits', []),
                    'selection_process': job_data.get('selection_process', [])
                }
            )
            
            if created:
                Job.objects.filter(id=job.id).update(posted_date=posted_date)
                self.stdout.write(f"Created job: {job.title} at {company.name}")
            else:
                self.stdout.write(f"Job already exists: {job.title} at {company.name}")

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with jobs.'))
