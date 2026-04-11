import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import type { Event } from "@shared/schema";
import sportsImage from "@assets/generated_images/students_playing_sports_on_a_school_field.png";
import libraryImage from "@assets/generated_images/students_reading_in_a_modern_school_library.png";

const fallbackEvents = [
  {
    id: "1",
    title: "Annual Sports Meet 2025",
    description: "Join us for our annual sports competition",
    date: "2025-12-15T09:00:00",
    category: "Sports",
    imageUrl: sportsImage
  },
  {
    id: "2",
    title: "Winter Science Exhibition",
    description: "Explore amazing science projects by our students",
    date: "2025-12-22T10:00:00",
    category: "Academic",
    imageUrl: libraryImage
  },
  {
    id: "3",
    title: "Parent-Teacher Meeting",
    description: "Meet with your child's teachers",
    date: "2026-01-05T08:30:00",
    category: "Meeting",
    imageUrl: null
  }
];

export function Events() {
  const [events, setEvents] = useState<Event[]>(fallbackEvents);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setEvents(data.slice(0, 3)); // Show only 3 most recent events
          }
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        // Keep fallback events
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const formatEventDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return {
        day: format(date, "dd"),
        month: format(date, "MMM").toUpperCase(),
      };
    } catch {
      return { day: "??", month: "???" };
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-secondary font-bold tracking-widest uppercase text-sm">Happening Now</span>
              <h2 className="text-4xl font-serif font-bold text-primary mt-2">News & Events</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-xl aspect-[4/3] mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-secondary font-bold tracking-widest uppercase text-sm">Happening Now</span>
            <h2 className="text-4xl font-serif font-bold text-primary mt-2">News & Events</h2>
          </div>
          <a href="/academic-calendar" className="hidden md:block text-primary font-bold hover:text-primary/80 transition-colors border-b-2 border-transparent hover:border-secondary">
            View All Events
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => {
            const { day, month } = formatEventDate(event.date);
            return (
              <div key={event.id} className="group cursor-pointer" data-testid={`card-event-${event.id}`}>
                <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-4 bg-muted">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      width={800}
                      height={600}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      data-testid={`img-event-${event.id}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                      <span className="text-primary/20 font-serif text-4xl font-bold">RIS</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white rounded-lg p-2 text-center min-w-[60px] shadow-lg">
                    <span className="block text-xs font-bold text-muted-foreground uppercase" data-testid={`text-event-month-${event.id}`}>
                      {month}
                    </span>
                    <span className="block text-2xl font-bold text-primary" data-testid={`text-event-day-${event.id}`}>
                      {day}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2" data-testid={`text-event-title-${event.id}`}>
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-event-description-${event.id}`}>
                  {event.description}
                </p>
                <span className="inline-block mt-2 text-xs font-semibold text-secondary uppercase tracking-wide" data-testid={`text-event-category-${event.id}`}>
                  {event.category}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center md:hidden">
           <a href="/academic-calendar" className="text-primary font-bold hover:text-primary/80 transition-colors" data-testid="link-view-all-events">
            View All Events
          </a>
        </div>
      </div>
    </section>
  );
}
