import React from "react";
import UserDashboard from "./UserDashboard";

interface StudentDashboardProps {
  onLogout?: () => void;
  onGoHome?: () => void;
}

export default function StudentDashboard(props: StudentDashboardProps) {
  return <UserDashboard {...props} />;
}
