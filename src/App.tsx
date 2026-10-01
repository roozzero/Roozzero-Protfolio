/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import LandingView from "./components/LandingView";
import LoginModal from "./components/LoginModal";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import { loadCmsConfig, saveCmsConfig, DEFAULT_HOMEPAGE_CLASSES } from "./constants/defaultCms";
import { CMSFullConfig } from "./types/cms";
import { authApi, cmsApi } from "./lib/api";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin" | "teacher">("user");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDashboardPage, setIsDashboardPage] = useState(window.location.hash === "#dashboard");
  const [isAdminPage, setIsAdminPage] = useState(window.location.hash === "#admin");

  // On application startup, verify authoritative server-side session
  useEffect(() => {
    let isMounted = true;
    authApi.getMe()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.user) {
          const u = res.data.user;
          const rawRole = (u.roleName || "").toLowerCase();
          const role = (rawRole === "administrator" || rawRole === "admin") ? "admin" : (rawRole === "teacher" ? "teacher" : "user");
          setIsLoggedIn(true);
          setUserRole(role);
          setCurrentUser(u);

          if (window.location.hash === "#login") {
            window.location.hash = role === "admin" ? "#admin" : "#dashboard";
          }
        } else {
          setIsLoggedIn(false);
          setUserRole("user");
          setCurrentUser(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoggedIn(false);
        setUserRole("user");
        setCurrentUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [cmsConfig, setCmsConfig] = useState<CMSFullConfig>(() => loadCmsConfig());

  // Dynamic Classes state synchronized with the CMS Admin Dashboard
  const [homepageClasses, setHomepageClasses] = useState<any[]>(DEFAULT_HOMEPAGE_CLASSES);

  // Load published CMS configuration from backend /api/cms on application startup
  useEffect(() => {
    let isMounted = true;
    cmsApi.getCms()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          saveCmsConfig(res.data);
          setCmsConfig(res.data);
          if (Array.isArray(res.data.classes) && res.data.classes.length > 0) {
            setHomepageClasses(res.data.classes);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load CMS from server:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time listener for homepage updates saved or published in the Admin CMS Dashboard
  useEffect(() => {
    const handleCmsUpdate = () => {
      const fresh = loadCmsConfig();
      setCmsConfig(fresh);
      if (Array.isArray(fresh.classes) && fresh.classes.length > 0) {
        setHomepageClasses(fresh.classes);
      }
    };
    window.addEventListener("cms_config_updated", handleCmsUpdate);
    return () => {
      window.removeEventListener("cms_config_updated", handleCmsUpdate);
    };
  }, []);

  const animatedTexts = useMemo(() => {
    if (cmsConfig.hero?.animatedTexts && cmsConfig.hero.animatedTexts.length > 0) {
      return cmsConfig.hero.animatedTexts;
    }
    return [
      "Full Stack Engineering",
      "React & Vite Optimization",
      "Cloud Computing & Deployments",
      "Elegant Design Systems"
    ];
  }, [cmsConfig.hero?.animatedTexts]);

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = animatedTexts[currentTextIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      }, 50);
    } else {
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }, 100);
    }

    if (!isDeleting && currentText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentTextIndex, animatedTexts]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#login") {
        setIsLoginModalOpen(true);
        window.location.hash = "";
      } else {
        setIsDashboardPage(hash === "#dashboard");
        setIsAdminPage(hash === "#admin");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Synchronize homepage classes from authoritative in-memory CMS state on hash change
  useEffect(() => {
    const handleHashChange = () => {
      const current = loadCmsConfig();
      if (Array.isArray(current.classes) && current.classes.length > 0) {
        setHomepageClasses(current.classes);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Redirect unauthenticated user accessing dashboard/admin back to landing page, keeping modal closed
  useEffect(() => {
    if (!isCheckingAuth && (isDashboardPage || isAdminPage) && !isLoggedIn) {
      setIsDashboardPage(false);
      setIsAdminPage(false);
      window.location.hash = "";
    }
  }, [isCheckingAuth, isDashboardPage, isAdminPage, isLoggedIn]);

  // Route guard: Non-admin users cannot access #admin, admin accessing #dashboard goes to #admin
  useEffect(() => {
    if (!isCheckingAuth && isLoggedIn) {
      if (isAdminPage && userRole !== "admin") {
        setIsAdminPage(false);
        setIsDashboardPage(true);
        window.location.hash = "#dashboard";
      } else if (isDashboardPage && userRole === "admin") {
        setIsDashboardPage(false);
        setIsAdminPage(true);
        window.location.hash = "#admin";
      }
    }
  }, [isCheckingAuth, isLoggedIn, isAdminPage, isDashboardPage, userRole]);

  // Redirect to corresponding dashboard if already authenticated user tries to access login when open
  useEffect(() => {
    if (!isCheckingAuth && isLoginModalOpen && isLoggedIn) {
      setIsLoginModalOpen(false);
      if (userRole === "admin") {
        window.location.hash = "#admin";
      } else {
        window.location.hash = "#dashboard";
      }
    }
  }, [isCheckingAuth, isLoginModalOpen, isLoggedIn, userRole]);

  useEffect(() => {
    if (!isDashboardPage && !isAdminPage && window.location.hash) {
      const targetId = window.location.hash.substring(1);
      if (targetId && targetId !== "login" && targetId !== "dashboard" && targetId !== "admin") {
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            const navbarHeight = 84;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - navbarHeight;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }
        }, 120);
      }
    }
  }, [isDashboardPage, isAdminPage]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Logout error", e);
    }
    setIsLoggedIn(false);
    setUserRole("user");
    setCurrentUser(null);
    setIsDashboardPage(false);
    setIsAdminPage(false);
    window.location.hash = "";
  };

  if (isDashboardPage && isLoggedIn) {
    if (userRole === "teacher") {
      return (
        <TeacherDashboard 
          onLogout={handleLogout}
          onGoHome={() => {
            window.location.hash = "#";
          }}
        />
      );
    }
    return (
      <UserDashboard 
        onLogout={handleLogout}
        onGoHome={() => {
          window.location.hash = "#";
        }}
      />
    );
  }

  if (isAdminPage && isLoggedIn && userRole === "admin") {
    return (
      <AdminDashboard 
        onLogout={handleLogout}
        onGoHome={() => {
          window.location.hash = "#";
        }}
      />
    );
  }

  return (
    <>
      <LandingView
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        cmsConfig={cmsConfig}
        homepageClasses={homepageClasses}
        currentText={currentText}
      />

      {/* Central Login Modal Overlay */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(role, user) => {
          setIsLoggedIn(true);
          setUserRole(role);
          if (user) {
            setCurrentUser(user);
          }
          setIsLoginModalOpen(false);
          if (role === "admin") {
            window.location.hash = "#admin";
          } else {
            window.location.hash = "#dashboard";
          }
        }}
      />
    </>
  );
}
