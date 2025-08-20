import { useState, useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Sidebar from "./sidebar"; // Adjust path to your Sidebar.jsx
import WalletSection from "../pages/wallet/walletSection";
import SearchBar from "@/components/SearchBar/searchBar";
import Dashboard from "../components/Dashboard";
import Notification from "../components/Notification";

export default function Home() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const loginAccount = user?.linkedAccounts?.[0];
  const loginMethod = loginAccount?.type;

  const displayName = loginAccount
    ? (loginMethod === "google_oauth" || loginMethod === "email"
      ? loginAccount.email || null
      : loginAccount.username || null)
    : null;

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const externalWallet = wallets.find((w) => w.walletClientType !== "privy");
  const walletAddress = embeddedWallet?.address || externalWallet?.address || null;

  const [points, setPoints] = useState(0);
  const [notification, setNotification] = useState(null);
  const [theme, setTheme] = useState("light");

  const [checklist, setChecklist] = useState({
    didSearch: false,
    viewedToken: false,
    usedFilter: false,
    clickedTelegram: false,
  });

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const checkAndAward = useCallback(() => {
    if (!walletAddress) return;
    const stored = localStorage.getItem(`points_${walletAddress}`);
    if (stored) {
      setPoints(Number(stored));
    } else {
      localStorage.setItem(`points_${walletAddress}`, "100");
      setPoints(100);
      setNotification("🎉 Welcome! You earned 100 points");
    }
  }, [walletAddress]);

  useEffect(() => {
    if (authenticated && walletAddress) {
      checkAndAward();
    }
  }, [authenticated, walletAddress, checkAndAward]);

  const handleChecklistChange = (key, checked) => {
    setChecklist((c) => ({ ...c, [key]: checked }));
    if (checked) {
      setPoints((p) => p + 25); // Increment points when completing a task
    }
  };

  if (!ready) return <p>Loading...</p>;

  return (
    <>
      {/* Hamburger icon (≡) */}
      <button
        className="sidebarToggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        &#9776;
      </button>
      <div className="layoutContainer" style={{ display: "flex", height: "100vh" }}>
        {/* Optional dim overlay */}
        {sidebarOpen && (
          <div
            className="sidebarBackdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          toggleTheme={toggleTheme}
          checklist={checklist}
          onChecklistChange={handleChecklistChange}
          points={points}
        />
        <main className="mainContent" style={{ flexGrow: 1, padding: "1rem 2rem" }}>
          <div className="searchBarMargin">
            <SearchBar />
          </div>
          <WalletSection
            authenticated={authenticated}
            login={login}
            logout={logout}
            loginMethod={loginMethod}
            embeddedWallet={embeddedWallet}
            externalWallet={externalWallet}
            displayName={displayName}
            points={points}
          />
          <Dashboard />
          {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
        </main>
      </div>
    </>
  );
}
