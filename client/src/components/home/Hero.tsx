export function Hero() {
  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "520px" }}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://rainbowinternationalschool.in/wp-content/uploads/2023/04/picwish.webp)`,
          backgroundColor: "#1565c0",
        }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(10, 60, 140, 0.78)" }} />
      </div>

      <div className="relative container mx-auto px-6 flex items-center" style={{ minHeight: "520px" }}>
        <div className="flex flex-col md:flex-row w-full items-center">
          <div className="flex-1 text-white py-16 md:py-20 pr-0 md:pr-8">
            <p className="text-white text-xl md:text-2xl font-normal mb-2 leading-snug">
              WORLD-CLASS EDUCATION,<br />
              INDIAN VALUES:
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Rainbow International<br />School
            </h1>
            <p className="text-white text-base md:text-lg mb-8 font-normal">
              NURSERY TO CLASS 12<sup>th</sup><br />
              CBSE AFFILIATED
            </p>
            <a href="#contact">
              <button
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-blue-900 transition-all duration-200 text-base"
                data-testid="button-hero-know-more"
              >
                Know More
              </button>
            </a>
          </div>

          <div className="flex-1 flex justify-center items-end pb-0 md:pb-0 hidden md:flex">
            <img
              src="https://rainbowinternationalschool.in/wp-content/uploads/2023/07/web-art-work-for-pranit-d-02-1024x831.png"
              alt="Students at Rainbow International School"
              className="max-h-80 object-contain drop-shadow-2xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none" style={{ height: "60px" }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}
