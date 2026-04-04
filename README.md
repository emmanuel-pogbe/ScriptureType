# 📖 ScriptureType

A fun, interactive **scripture-typing simulator** built with **Flask**.  
ScriptureType specifically helps church media and projection teams improve their typing speed, accuracy, and muscle memory by simulating real-world worship presentation software. 

## ✨ Features

### 💻 Multiple Software Environments
ScriptureType uniquely simulates the formatting, search syntaxes, and layouts of popular church presentation software. This lets you train in an environment that directly translates to Sunday service! Switch seamlessly between:
* **EasyWorship:** Train with the standard verse formatting and search input patterns native to EasyWorship.
* **VideoPsalm:** Practice typing and locating verses as you would in VideoPsalm's distinct search interface.
* **BibleShow:** Simulates the specific input style and layout behaviors utilized by BibleShow.

### ⏱️ Flexible Training Modes
Challenge yourself with highly customizable test modes tailored to how you want to train:
* **Scripture Count Mode:** Try to project a set number of scriptures as fast as possible. You can choose the default milestones (10 or 20 scriptures), or set a completely **custom scripture count** to push your limits.
* **Timed Mode:** Race against the clock! Type as many scriptures accurately as you can within a fixed time limit (e.g., 30s, 60s). Just like count mode, you can set a **custom timer** modifier to match your desired intensity.

### 🏆 Global Leaderboards
See how your scripture-typing skills rank against projectionists and players worldwide!
* **Categorized Rankings:** Compare scores filtered by your specific test type (e.g., Top scores for "Scriptures 10" or "Time 60").
* **Rich Profiles:** The leaderboard displays flags for international players, the presentation software they used to set the record, and precisely highlights your own personal ranking.
* **Smart Performance:** Built with dynamic fetching and a thread-safe connection pooled database to handle real-world traffic seamlessly.

## 🚀 Getting Started

1. Clone this repository.
2. Ensure you have Python installed, then install the dependencies via `pip install -r requirements.txt`. (Including `Flask`, `psycopg2`, and `python-dotenv`).
3. Set up your `.env` file with a `DATABASE_URL` pointing to a PostgreSQL instance.
4. Run `python app.py` and navigate to `http://localhost:5000` to start typing!
