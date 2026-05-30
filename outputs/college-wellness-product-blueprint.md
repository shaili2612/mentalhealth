# College Wellness Companion Product Blueprint

## Product Idea

A college wellness companion that helps students understand how their academics, habits, and emotions affect each other. Students track mood, stress, habits, journal entries, and deadlines. The app turns that information into personalized insights, gentle coaching, and campus-specific support.

The product should feel supportive, not clinical. It should never claim to diagnose mental health conditions.

## Core Value Proposition

Students often know they are stressed, but they do not always know why. This app helps answer:

- What patterns are affecting my mood?
- Which habits actually help me feel better?
- Are deadlines, sleep, exercise, or study hours connected to my stress?
- What support resources are available on campus?
- What small action can I take today?

## MVP Feature Set

### 1. Daily Check-In

Students log:

- Mood rating
- Stress rating
- Sleep hours
- Study hours
- Exercise
- Water intake
- Short journal entry

This is the foundation for every analytics and AI feature.

### 2. Journal + Emotion Tags

Students can write short reflections. The app can label entries with possible themes:

- Academic stress
- Anxiety
- Loneliness
- Motivation
- Burnout
- Social stress
- Positive progress

The labels should be presented as pattern insights, not medical conclusions.

Example:

> This entry seems related to academic stress and low motivation.

### 3. Assignment and Exam Tracker

Students add:

- Assignment title
- Course
- Due date
- Type: exam, assignment, project, quiz, presentation
- Estimated difficulty
- Completion status

The app compares deadlines with mood and stress trends.

Example insight:

> Your stress tends to rise during weeks with 3 or more deadlines.

### 4. Analytics Dashboard

Show clear visual summaries:

- Mood over time
- Stress over time
- Sleep vs mood
- Exercise vs stress
- Study hours vs burnout
- Deadline count vs stress

Resume-worthy feature:

> Your mood is 23% higher on days after 8+ hours of sleep.

### 5. Campus Survival Hub

A resource page for:

- Counseling center
- Crisis hotline
- Campus emergency number
- Study spaces
- Tutoring services
- Student organizations
- Recreation and wellness facilities

This should be editable so the app can be customized for a specific university.

### 6. Safety and Crisis Support

If a journal entry includes crisis-related language, the app should immediately show support resources.

Important rules:

- Do not diagnose.
- Do not say the user is unsafe with certainty.
- Do not hide emergency resources behind extra clicks.
- Encourage contacting trusted people or emergency services if there is immediate danger.

Example:

> It sounds like you may need immediate support. If you are in danger or might hurt yourself, call emergency services now. You can also contact 988 in the U.S. for crisis support.

## Standout AI Features

### AI Wellness Coach

The coach uses past check-ins and habits to make personal suggestions.

Good example:

> You reported feeling better on days you swam. Want to add swimming as a goal this week?

Avoid:

> You are depressed and should swim.

### Mood Forecasting

Predict likely stress risk for the next few days using:

- Upcoming deadlines
- Recent stress trend
- Recent sleep trend
- Study load
- Missed habits

Example:

> Based on your recent sleep and three upcoming deadlines, your stress may be higher this weekend.

### Semester Wellness Report

Generate a semester summary:

- Best mood month
- Most stressful week
- Average sleep
- Most helpful habit
- Deadline stress patterns
- Positive journal moments
- Goals achieved

This can become a polished "semester wrapped" experience.

## Suggested Screens

### Home Dashboard

Purpose: quick snapshot of today.

Include:

- Today's mood and stress check-in
- Upcoming deadlines
- Current streak
- One personalized insight
- Quick journal button

### Check-In Screen

Purpose: fast daily logging.

Include:

- Mood slider
- Stress slider
- Sleep input
- Study hours input
- Habit toggles
- Journal textbox

### Journal Screen

Purpose: reflection and emotional pattern tracking.

Include:

- Journal list
- Emotion/theme tags
- Search/filter by tag
- Positive moments section

### Academics Screen

Purpose: assignment and exam tracking.

Include:

- Calendar/list of deadlines
- Course filter
- Workload summary
- Stress warning for busy weeks

### Analytics Screen

Purpose: make the product feel intelligent.

Include:

- Correlation cards
- Trend charts
- Habit impact summaries
- Deadline impact insights

### Wellness Coach Screen

Purpose: personalized guidance.

Include:

- Suggested goal
- Reflection prompt
- Habit recommendation
- Weekly plan

### Campus Hub Screen

Purpose: real-world support.

Include:

- Emergency resources
- Counseling services
- Academic support
- Study spaces
- Social/student organizations

## Data Model

### User

- id
- name
- email
- university
- major
- year
- preferences

### CheckIn

- id
- user_id
- date
- mood_score
- stress_score
- sleep_hours
- study_hours
- exercise_minutes
- water_cups
- meditation_minutes
- notes

### JournalEntry

- id
- user_id
- created_at
- text
- detected_tags
- sentiment_score
- crisis_flag

### Assignment

- id
- user_id
- course
- title
- due_date
- type
- difficulty
- status

### HabitGoal

- id
- user_id
- habit_type
- target
- frequency
- active

### CampusResource

- id
- university
- category
- name
- description
- phone
- url
- location

## AI Safety Guidelines

Use language like:

- "This may suggest..."
- "Your recent pattern shows..."
- "You might consider..."
- "This is not a diagnosis."

Avoid language like:

- "You have anxiety."
- "You are depressed."
- "You will have a crisis."
- "This treatment will fix you."

For crisis detection, show resources immediately and encourage emergency help when needed.

## Build Phases

### Phase 1: Strong MVP

Build:

- Daily check-ins
- Journal entries
- Habit tracking
- Assignment tracker
- Basic dashboard
- Campus resources

Goal:

Create a usable student wellness tracker with college-specific value.

### Phase 2: Analytics

Build:

- Mood/stress charts
- Habit correlations
- Deadline workload insights
- Weekly summaries

Goal:

Make the app feel intelligent and product-level.

### Phase 3: AI Layer

Build:

- Journal emotion tagging
- Personalized wellness coach
- Mood forecasting
- Suggested goals

Goal:

Add differentiation without making unsafe medical claims.

### Phase 4: Engagement

Build:

- Wellness streaks
- Growth timeline
- Semester wellness report
- Positive memory highlights

Goal:

Make users want to return.

### Phase 5: Social Features

Build:

- Anonymous student community
- Peer support matching
- Interest-based groups

Goal:

Add community after the core private experience is strong.

## Recommended First Version

For a class project that feels like a real product, build these first:

1. Daily check-in
2. Journal with emotion tags
3. Assignment tracker
4. Analytics dashboard
5. AI wellness coach suggestions
6. Campus support hub

This combination is realistic to build, easy to demo, and impressive because it connects college workload with wellness data.

## Demo Story

A strong demo flow:

1. Student logs a stressful day with low sleep.
2. Student adds three upcoming assignments.
3. Dashboard warns that stress may increase this week.
4. Analytics shows that sleep and deadlines are connected to mood.
5. Wellness coach suggests a realistic goal.
6. Campus Hub shows support resources.
7. Semester report summarizes progress and patterns.

## Possible Tech Stack

Simple full-stack version:

- Frontend: React or Next.js
- Styling: Tailwind CSS
- Backend: Node.js/Express or Next.js API routes
- Database: Supabase or Firebase
- Charts: Recharts
- AI: OpenAI API for journal tagging and coaching

Class-project version:

- Frontend: React
- Data: Local storage or Firebase
- Charts: Recharts
- AI: rule-based mock responses first, real AI later

## Next Build Step

Start with a clickable dashboard prototype:

- Home dashboard
- Daily check-in form
- Assignment tracker
- Analytics cards
- Campus resources page

After that, connect the data and add AI-style insights.
