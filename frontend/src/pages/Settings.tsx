import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const CATEGORIES = [
  "Technology",
  "Business",
  "Science",
  "Health",
  "Entertainment",
  "Sports",
  "Politics",
  "World",
  "Environment",
  "Finance",
  "Education",
  "Travel",
  "Food",
  "Fashion",
  "Art",
];

const Settings = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Technology",
    "Science",
  ]);
  const [saved, setSaved] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem("newsflow_preferences");
    if (saved) {
      const prefs = JSON.parse(saved);
      setSelectedCategories(prefs.categories || ["Technology", "Science"]);
    }
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setSaved(false);
  };

  const savePreferences = () => {
    // Save to local storage only (no backend call for now)
    localStorage.setItem(
      "newsflow_preferences",
      JSON.stringify({
        categories: selectedCategories,
      })
    );
    setSaved(true);

    // Reset saved indicator after 2 seconds
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 px-4 md:px-0">
      <header className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl md:text-4xl font-bold tracking-tight"
        >
          Preferences
        </motion.h1>
        <p className="text-muted-foreground text-lg">
          Customize your news feed and appearance.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Dark Mode Toggle */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">Toggle dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Moon className="w-6 h-6 text-yellow-400" />
              ) : (
                <Sun className="w-6 h-6 text-orange-500" />
              )}
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-semibold">Interests</h2>
          <p className="text-sm text-muted-foreground">
            Select the topics you want to see in your daily briefing (
            {selectedCategories.length} selected)
          </p>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.includes(category)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={savePreferences}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl ${
              saved
                ? "bg-green-500 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save Preferences"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
