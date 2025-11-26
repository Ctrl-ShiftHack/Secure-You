import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect to login - onboarding removed
const Onboarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
};

export default Onboarding;
