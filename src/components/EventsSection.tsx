import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { Bell, ExternalLink, AlertTriangle, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

type Event = Tables<"events">;

function hideOnError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  img.style.display = "none";
  const wrapper = img.closest("[data-img-wrap]") as HTMLElement | null;
  if (wrapper) wrapper.style.display = "none";
}

function AlertCard({ event, index }: { event: Event; index: number }) {
  const isUpcoming = event.event_date && new Date(event.event_date) > new Date();
  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Dialog>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08 }}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            className="group text-left w-full rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sunset-orange"
          >
            {event.image_url && (
              <div data-img-wrap className="overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.title}
                  loading="lazy"
                  onError={hideOnError}
                  className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start gap-2">
                {isUpcoming ? (
                  <AlertTriangle className="w-4 h-4 text-sunset-orange mt-1 shrink-0" />
                ) : (
                  <Bell className="w-4 h-4 text-sunset-orange mt-1 shrink-0" />
                )}
                <h3 className="text-lg font-bold text-foreground line-clamp-2">{event.title}</h3>
              </div>
              {formattedDate && (
                <p className="flex items-center gap-1.5 text-sm text-sunset-orange font-medium mt-1 ml-6">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </p>
              )}
              {event.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 ml-6">
                  {event.description}
                </p>
              )}
            </div>
          </button>
        </DialogTrigger>
      </motion.div>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-extrabold text-foreground pr-6">
            {event.title}
          </DialogTitle>
          {formattedDate && (
            <DialogDescription className="flex items-center gap-1.5 text-sunset-orange font-medium">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </DialogDescription>
          )}
        </DialogHeader>

        {event.image_url && (
          <div data-img-wrap className="rounded-lg overflow-hidden bg-muted">
            <img
              src={event.image_url}
              alt={event.title}
              onError={hideOnError}
              className="w-full h-auto object-contain"
            />
          </div>
        )}

        {event.description && (
          <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        )}

        {event.registration_link && (
          <a
            href={event.registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-sunset hover:opacity-80 transition-opacity"
          >
            Learn More <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <section id="alerts" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sunset-red opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sunset-red" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-sunset-red">Live</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gradient-sunset">
            Live KEAM Alerts
          </h2>
          <p className="mt-3 text-muted-foreground text-base">
            Tap any alert to view full details & poster
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground py-16 text-lg">
            No active KEAM alerts. Check back soon! 🔔
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <AlertCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
