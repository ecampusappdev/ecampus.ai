// import React from "react";
// import Slider from "react-slick";
// import { motion } from "framer-motion";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import tiss from "/tiss.png";
// import symbiosis from "/symbiosis.png"
// import manipal from "/manipal.png" 


// const UniversitySlider= () => {
//   const items = [
//     {
//       id: 1,
//       name: "Amity University",
//       logo: "https://www.amity.edu/images/logo.png",
//       website: "https://amityonline.com/",
//       courses: 0,
//     },
//     {
//       id: 2,
//       name: "IGNOU",
//       logo: "https://ignouadmission.samarth.edu.in/assets/a74f1fcdb316b6bf926c620666d81788/site_files/logo-light.png",
//       website: "https://www.ignou.ac.in/",
//       courses: 0,
//     },
//     {
//       id: 3,
//       name: "Symbiosis",
//       logo: symbiosis,
//       website: "https://www.symbiosis.ac.in/",
//       courses: 0,
//     },
//     {
//       id: 4,
//       name: "Manipal University",
//       logo: manipal,
//       website: "https://www.manipal.edu/",
//       courses: 0,
//     },
//     {
//       id: 5,
//       name: "TISS",
//       logo: tiss,
//       website: "https://www.tiss.edu/",
//       courses: 0,
//     },
//     {
//       id: 6,
//       name: "NMIMS",
//       logo: "https://online.nmims.edu/images/NMIMS-CODE.png",
//       website: "https://online.nmims.edu/",
//       courses: 0,
//     },
//     {
//       id: 7,
//       name: "BITS Pilani",
//       logo: "https://bits-pilani-wilp.ac.in/public/assets/images/logo.png?v=2.0",
//       website: "https://www.bits-pilani.ac.in/",
//       courses: 0,
//     },
//     {
//       id: 8,
//       name: "JNU",
//       logo: "https://www.jnu.ac.in/sites/default/files/logo_0.png",
//       website: "https://www.jnu.ac.in/",
//       courses: 0,
//     },
//   ];

//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 600,
//     slidesToShow: 3,
//     slidesToScroll: 1,
//     arrows: true,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     pauseOnHover: true,
//     pauseOnFocus: false,
//     responsive: [
//       { breakpoint: 1024, settings: { slidesToShow: 3 } },
//       { breakpoint: 768, settings: { slidesToShow: 2 } },
//       { breakpoint: 640, settings: { slidesToShow: 1 } },
//     ],
//   };

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-10">
//       <Slider {...settings}>
//         {items.map((item) => (
//           <div key={item.id} className="px-3">
//             <div className="relative group bg-neutral-900 shadow-lg rounded-2xl overflow-hidden">
//               {/* Logo */}
//               <img
//                 src={item.logo}
//                 alt={item.name}
//                 className="h-40 w-full object-contain p-6"
//               />

//               {/* Overlay on hover */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 whileHover={{ opacity: 1 }}
//                 className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-between items-center text-white p-4"
//               >
//                 {/* Details above */}
//                 <div className="text-sm font-medium">{item.courses ? `${item.courses} Courses` : item.name}</div>

//                 {/* Logo stays visible (optional faded look) */}
//                 <img
//                   src={item.logo}
//                   alt={item.name}
//                   className="h-16 object-contain opacity-80"
//                 />

//                 {/* Name at bottom */}
//                 <a href={item.website} target="_blank" rel="noreferrer" className="text-lg font-semibold underline decoration-white/40 decoration-1 underline-offset-4">
//                   {item.name}
//                 </a>
//               </motion.div>
//             </div>
//           </div>
//         ))}
//       </Slider>
//     </div>
//   );
// };

// export default UniversitySlider;


import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import manipal from "/manipal.png";
import dypatil from "../assets/dypatil.png";
import mangalayatan from "../assets/mangalayatan.png"
const UniversitySlider = () => {
  // Initialize theme from localStorage immediately to prevent flash
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; // Default to dark if no preference
  });

  useEffect(() => {
    // Listen for theme changes
    const handleThemeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    
    // Theme is already initialized in useState, no need to load again

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  const items = [
    {
      id: 1,
      name: "Amity University",
      logo: "https://www.amity.edu/images/logo.png",
      website: "https://amityonline.com/",
      courses: "7+ Courses",
      students: "12k+ Students",
      teachers: "8+ Teachers",
    },
    {
      id: 2,
      name: "IGNOU",
      logo: "https://ignouadmission.samarth.edu.in/assets/a74f1fcdb316b6bf926c620666d81788/site_files/logo-light.png",
      website: "https://www.ignou.ac.in/",
      courses: "10+ Courses",
      students: "20k+ Students",
      teachers: "15+ Teachers",
    },
    {
      id: 3,
      name: "mangalayatan university",
      logo: mangalayatan,
      website: "https://www.muonline.ac.in/",
      courses: "12+ Courses",
      students: "18k+ Students",
      teachers: "20+ Teachers",
    },
    {
      id: 4,
      name: "Manipal University",
      logo: manipal,
      website: "https://www.manipal.edu/",
      courses: "15+ Courses",
      students: "25k+ Students",
      teachers: "30+ Teachers",
    },
    {
      id: 5,
      name: "DY Patil University",
      logo: dypatil,
      website: "https://www.dypatiledu.com/dypatil-university-online-education-mba-cta?source=DYPatil&media=IGAW&campaign=S-BRND-D&utm_source=Google&utm_Medium=Search&utm_campaign=15590069933&utm_adgroup=128498308502&utm_term=Dy%20patil%20online&utm_device=c&match_type=p&city=9184819&state=&gad_source=1&gad_campaignid=15590069933&gbraid=0AAAAAoOHAZOBR_kSHmV7HRHZoukm82s8y&gclid=CjwKCAjwlt7GBhAvEiwAKal0cn1VhdTGj-mefvEfb7DnrzLUOeuPfzKK4gwaTr9d_QJ2UmGUZalNZBoCezAQAvD_BwE#",
      courses: "9+ Courses",
      students: "10k+ Students",
      teachers: "12+ Teachers",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    pauseOnFocus: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, arrows: true } },
      { breakpoint: 768, settings: { slidesToShow: 2, arrows: true } },
      { breakpoint: 640, settings: { slidesToShow: 1, arrows: false, dots: true } },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Slider {...settings}>
        {items.map((item) => (
          <div key={item.id} className="px-2">
            <div className={`relative group shadow-lg rounded-xl overflow-hidden h-32 transition-colors duration-300 ${
              isDarkMode ? 'bg-neutral-900' : 'bg-gray-300'
            }`}>
              {/* Logo */}
              <img
                src={item.logo}
                alt={item.name}
                className="h-full w-full object-contain p-4"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              
              {/* Fallback text if logo fails to load */}
              <div className={`h-full w-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`} style={{display: 'none'}}>
                {item.name}
              </div>

             {/* Overlay on hover */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileHover={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="absolute inset-0 bg-black bg-opacity-85 flex flex-col justify-center items-center text-white p-3"
>
  {/* University details */}
  <div className="space-y-1 text-center">
    <p className="text-xs font-medium">
      <span className="text-white">{item.courses}</span>
    </p>
    <p className="text-xs font-medium">
      <span className="text-white">{item.students}</span>
    </p>
    <p className="text-xs font-medium">
      <span className="text-white">{item.teachers}</span>
    </p>
  </div>

  {/* Bottom link */}
  <a
    href={item.website}
    target="_blank"
    rel="noreferrer"
    className="mt-3 text-sm font-bold underline decoration-white/40 decoration-1 underline-offset-2 hover:text-emerald-300 transition-colors"
  >
    {item.name}
  </a>
</motion.div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default UniversitySlider;
