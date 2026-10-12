import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { logout } from "../API/API_Authen";
import Popup_AddItem from "../Popup/Popup_AddItem";
import Popup_Login from "../Popup/Popup_Login";
import Popup_register from "../Popup/Popup_register";
import signalrService from "../Services/signalrService";
import { useDebounce } from "../Hooks/useDebounce";
import "./Style/HomeLayout.css";

const HomeLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get("search") || "";
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const [showAddItemPopup, setShowAddItemPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get("search") || "";
    if (urlSearch !== searchTerm && urlSearch !== debouncedSearchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [location.search]);

  useEffect(() => {
    const currentParam = new URLSearchParams(location.search).get("search") || "";
    if (debouncedSearchTerm !== currentParam) {
      const searchParams = new URLSearchParams(location.search);
      if (debouncedSearchTerm) {
        searchParams.set("search", debouncedSearchTerm);
      } else {
        searchParams.delete("search");
      }
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  }, [debouncedSearchTerm, location.pathname, navigate]);

  const activeTab = location.pathname.includes("/cua-hang")
    ? "cua-hang"
    : location.pathname.includes("/can-mua")
    ? "can-mua"
    : location.pathname.includes("/thong-tin-ca-nhan") ||
      location.pathname.includes("/quan-ly-tai-khoan")
    ? ""
    : "vat-pham";

  useEffect(() => {
    const handleUnauthorized = (e) => {
      setUser(null);
      signalrService.stop();
      setIsDropdownOpen(false);
      setShowLoginPopup(true);
      if (e.detail?.message) {
        alert(e.detail.message);
      }
    };

    const handleOpenLogin = () => {
      setShowLoginPopup(true);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("auth:open-login", handleOpenLogin);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("auth:open-login", handleOpenLogin);
    };
  }, []);

  useEffect(() => {
    if (user) {
      signalrService.start();
    }
  }, [user]);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/vat-pham", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const searchParams = new URLSearchParams(location.search);
      if (searchTerm) {
        searchParams.set("search", searchTerm);
      } else {
        searchParams.delete("search");
      }
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Lỗi khi đăng xuất API:", e);
    }
    signalrService.stop();
    setUser(null);
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    navigate("/");
  };

  return (
    <div className="home-layout">
      <header className="home-header">
        <div className="header-left">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        <div className="header-right">
          {user && (
            <button className="btn-add" onClick={() => setShowAddItemPopup(true)}>
              + Vật phẩm
            </button>
          )}
          {!user ? (
            <div className="auth-links">
              <button
                type="button"
                className="auth-btn-link"
                onClick={() => setShowRegisterPopup(true)}
              >
                Đăng ký
              </button>
              <span className="separator">/</span>
              <button
                type="button"
                className="auth-btn-link"
                onClick={() => setShowLoginPopup(true)}
              >
                Đăng nhập
              </button>
            </div>
          ) : (
            <div className="user-menu-container">
              <button
                className="user-toggle-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {user.name || "Người dùng"} <span>▼</span>
              </button>
              {isDropdownOpen && (
                <div className="user-dropdown">
                  <Link 
                    to="/thong-tin-ca-nhan" 
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Thông tin
                  </Link>
                  {user.role?.toLowerCase() === "admin" && (
                    <Link 
                      to="/quan-ly-tai-khoan" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Tài khoản
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <nav className="home-tabs">
        <button
          className={`tab-btn ${activeTab === "cua-hang" ? "active" : ""}`}
          onClick={() => navigate("/cua-hang")}
        >
          Cửa hàng
        </button>
        <button
          className={`tab-btn ${activeTab === "vat-pham" ? "active" : ""}`}
          onClick={() => navigate("/vat-pham")}
        >
          Vật phẩm
        </button>
        {user && (
          <button
            className={`tab-btn ${activeTab === "can-mua" ? "active" : ""}`}
            onClick={() => navigate("/can-mua")}
          >
            Cần mua
          </button>
        )}
      </nav>

      <main className="home-main-content">
        <Outlet context={{ user }} />
      </main>

      {showAddItemPopup && (
        <Popup_AddItem
          onClose={() => setShowAddItemPopup(false)}
          onSuccess={() => {
            setShowAddItemPopup(false);
            window.dispatchEvent(new CustomEvent("stores-items:refresh"));
          }}
        />
      )}

      {showLoginPopup && (
        <Popup_Login
          onClose={() => setShowLoginPopup(false)}
          onSwitchToRegister={() => {
            setShowLoginPopup(false);
            setShowRegisterPopup(true);
          }}
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setShowLoginPopup(false);
          }}
        />
      )}

      {showRegisterPopup && (
        <Popup_register
          onClose={() => setShowRegisterPopup(false)}
          onSwitchToLogin={() => {
            setShowRegisterPopup(false);
            setShowLoginPopup(true);
          }}
        />
      )}
    </div>
  );
};

export default HomeLayout;
