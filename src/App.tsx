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
import { loadCmsConfig, DEFAULT_HOMEPAGE_CLASSES } from "./constants/defaultCms";
import { CMSFullConfig } from "./types/cms";
import { authApi } from "./lib/api";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin" | "teacher">("user");
  const [currentUser, setCurrentUser] = useState<any>(null);
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
          const role = rawRole === "administrator" ? "admin" : (rawRole === "teacher" ? "teacher" : "user");
          setIsLoggedIn(true);
          setUserRole(role);
          setCurrentUser(u);
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
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [cmsConfig, setCmsConfig] = useState<CMSFullConfig>(() => loadCmsConfig());

  // Dynamic Classes state synchronized with the CMS Admin Dashboard
  const [homepageClasses, setHomepageClasses] = useState<any[]>(() => {
    const saved = localStorage.getItem("cms_current_config");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config && Array.isArray(config.classes)) {
          const nonTechzo = config.classes.filter((c: any) => c.id !== "techzo");
          const updated = nonTechzo.map((c: any) => {
            const def = DEFAULT_HOMEPAGE_CLASSES.find((d) => d.id === c.id);
            if (c.id === "wordpress") {
              const wpDef = DEFAULT_HOMEPAGE_CLASSES.find((d) => d.id === "wordpress");
              return wpDef || c;
            }
            if (def && (!c.syllabus || c.syllabus.length < 10 || !c.courseImage || c.courseImage.includes("photo-1550751827-4bd374c3f58b"))) {
              return { ...c, syllabus: def.syllabus, sessions: def.sessions, courseName: def.courseName, courseImage: def.courseImage, shortDescription: def.shortDescription, description: def.description, tags: def.tags, instructor: def.instructor, price: def.price };
            }
            return c;
          });
          const existingIds = new Set(updated.map((c: any) => c.id));
          const missingDefaults = DEFAULT_HOMEPAGE_CLASSES.filter((c) => !existingIds.has(c.id));
          const merged = [...updated, ...missingDefaults];
          localStorage.setItem("cms_current_config", JSON.stringify({ ...config, classes: merged }));
          return merged;
        }
      } catch (e) {
        console.error("Failed to parse homepage classes", e);
      }
    }
    return DEFAULT_HOMEPAGE_CLASSES;
  });

  // Real-time listener for homepage updates saved or published in the Admin CMS Dashboard
  useEffect(() => {
    const handleCmsUpdate = () => {
      const fresh = loadCmsConfig();
      setCmsConfig(fresh);
      if (Array.isArray(fresh.classes)) {
        setHomepageClasses(fresh.classes);
      }
    };
    window.addEventListener("cms_config_updated", handleCmsUpdate);
    window.addEventListener("storage", handleCmsUpdate);
    return () => {
      window.removeEventListener("cms_config_updated", handleCmsUpdate);
      window.removeEventListener("storage", handleCmsUpdate);
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

  // Reload homepage classes whenever hash changes so that it picks up any admin dashboard edits!
  useEffect(() => {
    const handleHashChange = () => {
      const saved = localStorage.getItem("cms_current_config");
      if (saved) {
        try {
          const config = JSON.parse(saved);
          if (config && Array.isArray(config.classes)) {
            const nonTechzo = config.classes.filter((c: any) => c.id !== "techzo");
            const updated = nonTechzo.map((c: any) => {
              const def = DEFAULT_HOMEPAGE_CLASSES.find((d) => d.id === c.id);
              if (def && (!c.syllabus || c.syllabus.length < 10 || !c.courseImage || c.courseImage.includes("photo-1550751827-4bd374c3f58b") || (c.id === "wordpress" && c.courseName !== "WordPress Development & Design"))) {
                return { ...c, syllabus: def.syllabus, sessions: def.sessions, courseName: def.courseName, courseImage: def.courseImage, shortDescription: def.shortDescription, description: def.description, tags: def.tags };
              }
              return c;
            });
            const existingIds = new Set(updated.map((c: any) => c.id));
            const missingDefaults = DEFAULT_HOMEPAGE_CLASSES.filter((c) => !existingIds.has(c.id));
            setHomepageClasses([...updated, ...missingDefaults]);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Redirect unauthenticated user accessing dashboard/admin back to landing page, keeping modal closed
  useEffect(() => {
    if ((isDashboardPage || isAdminPage) && !isLoggedIn) {
      setIsDashboardPage(false);
      setIsAdminPage(false);
      window.location.hash = "";
    }
  }, [isDashboardPage, isAdminPage, isLoggedIn]);

  // Redirect to corresponding dashboard if already authenticated user tries to access login when open
  useEffect(() => {
    if (isLoginModalOpen && isLoggedIn) {
      setIsLoginModalOpen(false);
      if (userRole === "admin") {
        window.location.hash = "#admin";
      } else {
        window.location.hash = "#dashboard";
      }
    }
  }, [isLoginModalOpen, isLoggedIn, userRole]);

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
    window.location.hash = "#login";
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
          setTimeout(() => {
            setIsLoginModalOpen(false);
            if (role === "admin") {
              window.location.hash = "#admin";
            } else {
              window.location.hash = "#dashboard";
            }
          }, 1500);
        }}
      />
    </>
  );
}
