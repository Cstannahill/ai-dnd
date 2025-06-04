import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Settings, ChevronDown, Moon, Sun } from "lucide-react";

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <nav className="bg-card text-card-foreground shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-primary font-bold text-xl"
        >
          <img
            src="/ctan-dnd-main.png"
            alt="Logo"
            className="w-8 h-8 rounded-md"
          />
          AI<span className="text-secondary">DM</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/campaigns" className="hover:text-primary">
            Campaigns
          </Link>
          <Link to="/characters" className="hover:text-primary">
            Characters
          </Link>
          <Link to="/about" className="hover:text-primary">
            About
          </Link>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 hover:text-primary"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:text-primary"
          >
            <User className="w-5 h-5" />
            Profile
            <ChevronDown className="w-4 h-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card text-card-foreground shadow-lg rounded-md">
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-primary hover:text-primary-foreground"
              >
                <User className="w-4 h-4 inline-block mr-2" /> My Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-primary hover:text-primary-foreground"
              >
                <Settings className="w-4 h-4 inline-block mr-2" /> Settings
              </Link>
              <Link
                to="/logout"
                className="block px-4 py-2 hover:bg-primary hover:text-primary-foreground"
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
