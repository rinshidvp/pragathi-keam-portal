import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Globe } from "lucide-react";

export default function Footer() {
  const [links, setLinks] = useState<Tables<"social_links">[]>([]);

  useEffect(() => {
    supabase
      .from("social_links")
      .select("*")
      .then(({ data }) => setLinks(data ?? []));
  }, []);

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-gradient-sunset">
              KEAM Help Desk 2026
            </h3>
            <p className="text-sm text-background/60 mt-1">
              Pragathi College Union — TKM College of Engineering
            </p>
          </div>

          {links.length > 0 && (
            <div className="flex gap-4">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/10 hover:bg-background/20 text-sm transition-colors"
                  aria-label={link.platform_name}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {link.platform_name}
                </a>
              ))}
            </div>
          )}

          <p className="text-xs text-background/40">
            © {new Date().getFullYear()} Pragathi College Union. All rights reserved.
          </p>

          {/* CosmIQ Signature */}
          <div className="flex flex-col items-center gap-1 pt-2 border-t border-background/10 w-full max-w-sm">
            <a
              href="https://www.cosmiqproject.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-xs text-background/50 hover:text-background/70 transition-colors"
            >
              <img
                src="/images/cosmiq-logo-white.png"
                alt=""
                className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
              />
              <span>
                Designed & Developed by{" "}
                <span className="font-semibold text-amber-400/80 group-hover:text-amber-300 transition-colors">
                  CosmIQ
                </span>
                {" "}| Innovative Software Solutions
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
