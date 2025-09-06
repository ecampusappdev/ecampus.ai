
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import symbiosis from "../assets/symbiosis.png";

const ITEMS_PER_SLIDE = 4;

function chunkAndPad(list, size) {
  const chunks = [];
  for (let i = 0; i < list.length; i += size) {
    const slice = list.slice(i, i + size);
    while (slice.length < size) {
      slice.push({ id: `pad-${i}-${slice.length}`, __pad: true });
    }
    chunks.push(slice);
  }
  return chunks.length ? chunks : [[]];
}

const UniversityCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const universities = [
    {
      id: 1,
      name: "Amity University",
      logo: "https://www.amity.edu/images/logo.png", // add your URL
      website: "https://www.amity.edu/online/",
      description: "Leading private university with comprehensive online programs",
    },
    {
      id: 2,
      name: "IGNOU",
      logo: "https://www.ignou.ac.in/assets/img/ignouLogo.png", // add your URL
      website: "https://www.ignou.ac.in/",
      description: "India's largest open university with flexible learning options",
    },
    {
      id: 3,
      name: "Symbiosis",
      logo: symbiosis, // add your URL
      website: "https://www.symbiosis.ac.in/",
      description: "Premier private university with industry-focused programs",
    },
    {
      id: 4,
      name: "Manipal University",
      logo: "https://www.manipal.edu/content/dam/manipal/mu/mcops-manipal/Images_new/MAHE_Color.svg", // add your URL
      website: "https://www.manipal.edu/",
      description: "Established university with global recognition and quality education",
    },
    {
      id: 5,
      name: "TISS",
      logo: "https://tiss.ac.in/uploads/images/tiss-logo_uJSyK8O.png", // add your URL
      website: "https://www.tiss.edu/",
      description: "Social sciences focused university with research excellence",
    },
    {
      id: 6,
      name: "NMIMS",
      logo: "https://www.nmims.edu/images/nmims-university-logo.png", // add your URL
      website: "https://www.nmims.edu/",
      description: "Business and management focused university with industry",
    },
    {
      id: 7,
      name: "BITS Pilani",
      logo: "https://www.bits-pilani.ac.in/wp-content/uploads/bits-pillani-2-1.webp", // add your URL
      website: "https://www.bits-pilani.ac.in/",
      description: "Premier engineering and technology institute with online programs",
    },
    {
      id: 8,
      name: "JNU",
      logo: "https://www.jnu.ac.in/sites/default/files/logo_0.png", // add your URL
      website: "https://www.jnu.ac.in/",
      description: "Leading research university with diverse academic programs",
    },
    {
      id: 5,
      name: "TISS",
      logo: "https://tiss.ac.in/uploads/images/tiss-logo_uJSyK8O.png", // add your URL
      website: "https://www.tiss.edu/",
      description: "Social sciences focused university with research excellence",
    },
    {
      id: 6,
      name: "NMIMS",
      logo: "https://www.nmims.edu/images/nmims-university-logo.png", // add your URL
      website: "https://www.nmims.edu/",
      description: "Business and management focused university with industry",
    },
    {
      id: 7,
      name: "BITS Pilani",
      logo: "https://www.bits-pilani.ac.in/wp-content/uploads/bits-pillani-2-1.webp", // add your URL
      website: "https://www.bits-pilani.ac.in/",
      description: "Premier engineering and technology institute with online programs",
    },
    {
      id: 8,
      name: "JNU",
      logo: "https://www.jnu.ac.in/sites/default/files/logo_0.png", // add your URL
      website: "https://www.jnu.ac.in/",
      description: "Leading research university with diverse academic programs",
    },
  ];

  const pages = useMemo(() => chunkAndPad(universities, ITEMS_PER_SLIDE), [universities]);
  const slidesCount = pages.length;

  const next = () => setCurrentIndex((i) => (i + 1) % slidesCount);
  const prev = () => setCurrentIndex((i) => (i - 1 + slidesCount) % slidesCount);

  // Auto slide (optional)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % slidesCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [slidesCount]);

  const handleCardClick = (website, isPad) => {
    if (!isPad && website) {
      window.open(website, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-6 text-center text-blue-300">
        Top Universities Offering Online Courses
      </h3>

      <div className="relative overflow-hidden">
        {/* Track */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {pages.map((page, pageIdx) => (
            <div key={pageIdx} className="w-full flex-shrink-0 px-2">
              {/* Row of 4 cards */}
              <div className="-mx-2 flex">
                {page.map((u) => (
                  <div key={u.id} className="w-1/4 px-2">
                    <div
                      onClick={() => handleCardClick(u.website, u.__pad)}
                      className={`h-full bg-blue-500 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition
                                  ${u.__pad ? "pointer-events-none opacity-0" : "cursor-pointer"}`}
                    >
                      {/* Image area (no black bg) */}
                      <div className="h-44 bg-neutral-500 w-full flex items-center justify-center">
                        {u.logo ? (
                          <img
                            src={u.logo}
                            alt={u.name}
                            className="max-h-40 w-auto object-contain"
                          />
                        ) : (
                          // keep area white and clean if you haven't added a logo yet
                          <div className="text-sm text-gray-400 select-none">
                            {/* Empty placeholder - stays white */}
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <div className=" bg-black p-4 text-center">
                        <h4 className="text-base font-semibold text-white">{u.name}</h4>
                        <p className="mt-1 text-sm text-white">{u.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Nav buttons */}
        {slidesCount > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-3 shadow hover:bg-gray-50"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-3 shadow hover:bg-gray-50"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: slidesCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default UniversityCarousel;
