import sportsImage from "@assets/generated_images/students_playing_sports_on_a_school_field.png";
import libraryImage from "@assets/generated_images/students_reading_in_a_modern_school_library.png";

const events = [
  {
    day: "15",
    month: "DEC",
    title: "Annual Sports Meet 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Main Sports Complex",
    image: sportsImage
  },
  {
    day: "22",
    month: "DEC",
    title: "Winter Science Exhibition",
    time: "10:00 AM - 2:00 PM",
    location: "School Auditorium",
    image: libraryImage
  },
  {
    day: "05",
    month: "JAN",
    title: "Parent-Teacher Meeting",
    time: "8:30 AM - 12:30 PM",
    location: "Classrooms",
    image: null // Fallback color
  }
];

export function Events() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-secondary font-bold tracking-widest uppercase text-sm">Happening Now</span>
            <h2 className="text-4xl font-serif font-bold text-primary mt-2">News & Events</h2>
          </div>
          <a href="/events" className="hidden md:block text-primary font-bold hover:text-primary/80 transition-colors border-b-2 border-transparent hover:border-secondary">
            View All Events
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-4 bg-muted">
                {event.image ? (
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                    <span className="text-primary/20 font-serif text-4xl font-bold">RIS</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white rounded-lg p-2 text-center min-w-[60px] shadow-lg">
                  <span className="block text-xs font-bold text-muted-foreground uppercase">{event.month}</span>
                  <span className="block text-2xl font-bold text-primary">{event.day}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {event.title}
              </h3>
              <div className="text-sm text-muted-foreground flex flex-col gap-1">
                <span>{event.time}</span>
                <span>{event.location}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
           <a href="/events" className="text-primary font-bold hover:text-primary/80 transition-colors">
            View All Events
          </a>
        </div>
      </div>
    </section>
  );
}
