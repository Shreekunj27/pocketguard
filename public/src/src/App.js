import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [budget, setBudget] = useState(5000);
  const [savings, setSavings] = useState(500);
  const [usable, setUsable] = useState(4500);
  const [expenses, setExpenses] = useState([]);
  const [todaySpending, setTodaySpending] = useState(0);
  const [mood, setMood] = useState("neutral");
  const [alerts, setAlerts] = useState([]);
  const [rewards, setRewards] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("food");
  const [showReportCard, setShowReportCard] = useState(false);

  const dailyLimit = Math.floor(usable / 30);
  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = usable - totalSpending;

  const handleBudgetChange = (e) => {
    const val = Number(e.target.value);
    setBudget(val);
    setSavings(Math.floor(val * 0.1));
    setUsable(Math.floor(val * 0.9));
  };

  const addExpense = () => {
    if (!expenseAmount || expenseAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const amount = Number(expenseAmount);
    const today = new Date().toDateString();
    const newExpense = { amount, category: expenseCategory, mood, date: today };

    setExpenses([...expenses, newExpense]);
    setTodaySpending(todaySpending + amount);
    setExpenseAmount("");

    let newAlerts = [];

    if (mood === "stressed" || mood === "sad") {
      if (expenseCategory !== "study" && expenseCategory !== "medicine") {
        newAlerts.push("⚠️ Avoid emotional shopping! This is a stressful purchase.");
      }
    }

    if (todaySpending + amount > dailyLimit) {
      newAlerts.push(`⚠️ Daily limit exceeded! You've spent ₹${todaySpending + amount} today (limit: ₹${dailyLimit})`);
    }

    const last3 = expenses.slice(-2);
    if (last3.length === 2 && last3[0].amount < last3[1].amount && last3[1].amount < amount) {
      newAlerts.push("📈 Increasing expenses detected! Your spending is rising consecutively.");
    }

    const daysRemaining = 30 - Math.ceil(expenses.length / 3);
    const avgDaily = totalSpending / Math.max(1, expenses.length);
    if (avgDaily * daysRemaining > remainingBudget) {
      newAlerts.push(`⚠️ Budget Alert: At this rate, you'll run out of money in ${Math.ceil(remainingBudget / avgDaily)} days!`);
    }

    if (newAlerts.length > 0) {
      setAlerts([...alerts, ...newAlerts]);
    }

    if (todaySpending + amount <= dailyLimit) {
      setConsecutiveDays(consecutiveDays + 1);
      if ((consecutiveDays + 1) % 3 === 0) {
        setRewards(rewards + 10);
        setAlerts([...alerts, `🎉 Great job! You stayed within budget for ${consecutiveDays + 1} days! +10 points`]);
      }
    }
  };

  const addEmergencyExpense = () => {
    if (!expenseAmount || expenseAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const amount = Number(expenseAmount);
    const today = new Date().toDateString();
    const newExpense = { amount, category: "emergency", mood: "neutral", date: today, isEmergency: true };

    setExpenses([...expenses, newExpense]);
    setExpenseAmount("");
    setAlerts([...alerts, `✅ Emergency expense (₹${amount}) deducted from savings without penalty.`]);
  };

  const getMicroSavingSuggestion = () => {
    const suggestions = [
      "Save ₹20 this week by reducing coffee purchases",
      "You can save ₹50 by reducing 10% spending",
      "Skip one meal out and save ₹100 this week",
      "Cut entertainment by 20% to save ₹30",
      "Track snacks – you could save ₹15 daily"
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setAlerts([...alerts, `💡 ${randomSuggestion}`]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTodaySpending(0);
    }, 24 * 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const generateReportCard = () => {
    const categories = {};
    expenses.forEach((exp) => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });

    const overspendingDays = Math.ceil(totalSpending / (dailyLimit || 1)) - 30;
    const totalSavings = savings + (usable - totalSpending);

    return (
      <div className="report-card">
        <h2>📊 Monthly Report Card</h2>
        <div className="report-details">
          <p><strong>Total Spending:</strong> ₹{totalSpending}</p>
          <p><strong>Total Savings:</strong> ₹{totalSavings}</p>
          <p><strong>Remaining Budget:</strong> ₹{remainingBudget}</p>
          <p><strong>Overspending Days:</strong> {Math.max(0, overspendingDays)}</p>
          <p><strong>Reward Points:</strong> {rewards}</p>

          <h3>Spending by Category:</h3>
          {Object.keys(categories).length > 0 ? (
            <ul>
              {Object.entries(categories).map(([cat, amount]) => (
                <li key={cat}><strong>{cat}:</strong> ₹{amount}</li>
              ))}
            </ul>
          ) : (
            <p>No expenses recorded yet</p>
          )}

          <p className="performance">
            {remainingBudget > 0 ? "✅ Great performance! You're on track." : "⚠️ Budget exceeded. Plan better next month."}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>💰 PocketGuard</h1>
        <p>Smart Finance Assistant for Students</p>
      </header>

      <main className="app-main">
        <section className="section budget-section">
          <h2>📋 Monthly Budget Setup</h2>
          <label>
            Monthly Budget (₹):
            <input
              type="number"
              value={budget}
              onChange={handleBudgetChange}
              min="1000"
              step="500"
            />
          </label>
          <div className="budget-breakdown">
            <div className="breakdown-item">
              <span>Auto-Saved (10%):</span>
              <strong>₹{savings}</strong>
            </div>
            <div className="breakdown-item">
              <span>Usable Amount:</span>
              <strong>₹{usable}</strong>
            </div>
            <div className="breakdown-item highlight">
              <span>Safe Daily Limit:</span>
              <strong>₹{dailyLimit}</strong>
            </div>
          </div>
        </section>

        <section className="section add-expense-section">
          <h2>➕ Add Expense</h2>
          <div className="expense-form">
            <input
              type="number"
              placeholder="Amount (₹)"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              min="0"
            />
            <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
              <option value="food">🍔 Food</option>
              <option value="entertainment">🎬 Entertainment</option>
              <option value="transport">🚌 Transport</option>
              <option value="study">📚 Study</option>
              <option value="medicine">💊 Medicine</option>
              <option value="personal">💅 Personal Care</option>
              <option value="other">📦 Other</option>
            </select>
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="neutral">😐 Neutral</option>
              <option value="happy">😊 Happy</option>
              <option value="stressed">😰 Stressed</option>
              <option value="sad">😢 Sad</option>
            </select>
            <button className="btn-primary" onClick={addExpense}>Add Expense</button>
            <button className="btn-emergency" onClick={addEmergencyExpense}>🚨 Emergency (Study/Medicine)</button>
          </div>
        </section>

        {alerts.length > 0 && (
          <section className="section alerts-section">
            <h2>🔔 Alerts & Notifications</h2>
            <div className="alerts-list">
              {alerts.map((alert, idx) => (
                <div key={idx} className="alert-item">
                  {alert}
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={() => setAlerts([])}>Clear Alerts</button>
          </section>
        )}

        <section className="section reward-section">
          <h2>🏆 Reward Points: {rewards}</h2>
          <p>Keep staying within your daily budget to earn more rewards!</p>
          <button className="btn-primary" onClick={getMicroSavingSuggestion}>💡 Get Micro-Saving Tip</button>
        </section>

        <section className="section spending-section">
          <h2>💸 Spending Overview</h2>
          <div className="spending-stats">
            <div className="stat-item">
              <span>Total Spending:</span>
              <strong>₹{totalSpending}</strong>
            </div>
            <div className="stat-item">
              <span>Remaining:</span>
              <strong className={remainingBudget >= 0 ? "positive" : "negative"}>₹{remainingBudget}</strong>
            </div>
            <div className="stat-item">
              <span>Today's Spending:</span>
              <strong className={todaySpending <= dailyLimit ? "positive" : "negative"}>₹{todaySpending} / ₹{dailyLimit}</strong>
            </div>
          </div>
        </section>

        {expenses.length > 0 && (
          <section className="section expenses-list-section">
            <h2>📝 Recent Expenses</h2>
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Mood</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice().reverse().map((exp, idx) => (
                  <tr key={idx}>
                    <td>{exp.category}</td>
                    <td>₹{exp.amount}</td>
                    <td>{exp.mood}</td>
                    <td>{exp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="section">
          <button className="btn-primary" onClick={() => setShowReportCard(!showReportCard)}>
            {showReportCard ? "Hide" : "Show"} Monthly Report Card
          </button>
          {showReportCard && generateReportCard()}
        </section>
      </main>

      <footer className="app-footer">
        <p>Made with ❤️ for hostel & PG students | PocketGuard v1.0</p>
      </footer>
    </div>
  );
}

export default App;
