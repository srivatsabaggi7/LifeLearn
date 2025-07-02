# 🎓 LifeLearn — Moulding Through Fun

*LifeLearn* is an engaging, interactive mobile application built to equip young individuals with essential life skills through gamified learning experiences. The goal is to make learning crucial life concepts fun, interactive, and rewarding, ensuring skill development beyond traditional academics.

This project aligns with modern educational needs, emphasizing experiential learning, habit formation, and practical life skills — all delivered through a mobile-first, intuitive platform.

---

## 💡 *What Does LifeLearn Do?*

LifeLearn combines interactive games, habit tracking, and progress monitoring to cultivate life skills in students, such as:

✅ Financial literacy (e.g., budgeting games)
✅ Critical thinking and decision-making
✅ Memory enhancement exercises
✅ Daily streaks to promote consistency
✅ Visual progress tracking with motivating feedback

The app leverages mobile technology to make learning accessible, enjoyable, and integrated into daily routines — transforming life skill development into a fun, game-like experience.

---

## 📲 *How LifeLearn Works*

When users open the app:

1. *Authentication Flow*

   * Users can Sign Up or Log In
   * Credentials are stored locally (demo mode — no backend)

2. *Persistent User Sessions*

   * If already logged in, users are redirected to the main dashboard
   * Authentication status is checked using AsyncStorage

3. *Gamified Dashboard*

   * Displays user's name, learning streaks, recent game scores
   * Offers a motivational, visual overview of progress

4. *Interactive Games & Activities*

   * Budget Management Game
   * Situation-Based Decision Making
   * Memory Development Exercises
   * Scores are tracked locally, reinforcing learning with measurable feedback

---

## 📄 *Pages & Their Roles*

| Page                       | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| /auth/login.tsx          | User login screen with credential storage (local demo) |
| /auth/signup.tsx         | Sign-up form for new users                             |
| /app/index.tsx           | App entry point — redirects based on auth status       |
| /app/(tabs)/index.tsx    | Main home screen — shows scores, streaks, profile info |
| /app/(tabs)/profile.tsx  | (Assumed) User profile details and settings            |
| /app/(tabs)/[other tabs] | Placeholders for adding more life skill activities     |

Additional files manage routing, layouts, and app configuration.

---

## ⚙ *Technology Stack*

* *React Native + Expo* — Cross-platform mobile app development
* *TypeScript* — Strong typing for reliable, scalable code
* *AsyncStorage* — Local storage of user sessions and game data
* *Expo Router* — Simplified file-based navigation
* *Lucide React Native* — Modern iconography for a polished UI
