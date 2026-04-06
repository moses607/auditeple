import { useLocation, NavLink } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto p-8">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-3xl font-bold text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>404</span>
        </div>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Page introuvable
        </h1>
        <p className="text-sm text-muted-foreground">
          La page <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{location.pathname}</code> n'existe pas dans CIC Expert Pro.
        </p>
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Retour au tableau de bord
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;
