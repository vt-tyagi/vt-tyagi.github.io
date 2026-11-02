/*
  Site content lives here. To add a new paper, award or job, copy an
  existing entry, edit it, and save. Newest entries go at the top.
*/
const SITE = {
  links: [
    // icon: brand mark in assets/icons (Simple Icons, CC0); color: the brand's own colour
    { name: "Google Scholar", url: "https://scholar.google.com/citations?user=BVE2X2sAAAAJ&hl=en", icon: "googlescholar", color: "#4285F4" },
    { name: "ResearchGate", url: "https://www.researchgate.net/profile/Vaibhav-Tyagi-14", icon: "researchgate", color: "#00CCBB" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/vaibhav-tyagi-6b4800173", icon: "linkedin", color: "#0A66C2" },
    { name: "GitHub", url: "https://github.com/vt-tyagi", icon: "github", color: "#24292F" }
  ],

  // Newest first. Shown on the home page.
  news: [
    { date: "Oct 2026", text: "Joined McGill University as a Postdoctoral Researcher." },
    { date: "2026", text: "Received the URSI Young Scientist Award at URSI GASS 2026." },
    { date: "Jul 2026", text: "Started as Translational Research Fellow at IIT Indore." },
    { date: "Jun 2026", text: "Completed my Ph.D. at IIT Indore." },
    { date: "2026", text: "Paper on ML-based bias correction of radar observations published in IEEE GRSL." },
    { date: "Jan 2026", text: "Visiting Scientist at KNMI, the Netherlands." }
  ],

  /*
    Research areas. code = label on the card, scale = colour bar,
    demo = which interactive simulation shows on the Research page (qc | flow | zr | scatt),
    points = short bullet list of topics under each area.
  */
  areas: [
    // focus: true marks the current research focus (highlighted badge)
    { code: "CONV·WIVERN", scale: "wind", demo: "wivern", focus: true,
      title: "Convective Dynamics: Vertical winds in convection from WIVERN",
      short: "Studying convective updrafts and downdrafts by retrieving vertical air motion from the line-of-sight winds of the WIVERN Doppler radar mission.",
      long: [
        "The science objective is to understand convective dynamics: how updrafts and downdrafts form, organise and evolve inside storms, and how they control heavy rainfall, hail and damaging winds. Vertical air motion is the engine of convection, yet it remains one of the least observed quantities in the atmosphere, especially over oceans and regions without ground radars.",
        "WIVERN (WInd VElocity Radar Nephoscope), a candidate ESA Earth Explorer mission, would carry a conically scanning W-band Doppler radar that measures winds inside clouds and precipitation from space. Because it looks at a slant, each measurement is a line-of-sight (LOS) velocity that mixes three things: the projection of the horizontal wind, the vertical air motion (up- and downdrafts), and the fall speed of rain, snow and ice.",
        "My current work focuses on separating these components to retrieve vertical winds inside convective systems: estimating hydrometeor terminal velocities, removing the horizontal-wind contribution, and combining WIVERN observations with ground-based Doppler radars and models."
      ],
      points: ["Convective updrafts and downdrafts: structure, strength and life cycle", "Line-of-sight Doppler winds from space (WIVERN)", "Separating horizontal wind, vertical air motion and hydrometeor fall speed", "Vertical wind retrieval inside convective storms", "Synergy with ground-based Doppler radar and NWP"] },
    { code: "DSP·QC", scale: "dbz", demo: "qc",
      title: "Radar signal processing & quality control",
      short: "Turning raw Doppler and dual-polarization radar signals into clean, trustworthy data.",
      long: "Advanced signal processing and quality control techniques turn raw weather radar signals into reliable data for science and forecasting. This means identifying and removing ground clutter, beam blockage, calibration biases and non-meteorological echoes. As radar networks grow, these techniques need to be automated, robust and fast enough for real-time operations.",
      points: ["Clutter and non-meteorological echo mitigation", "Bias correction and calibration", "Automated quality control at network scale"] },
    // long may be a list of paragraphs; demos are shown in the order given
    { code: "NOWCAST·QPE", scale: "rain", demo: ["zr", "nowcast"],
      title: "Radar-based nowcasting & QPE",
      short: "How much rain is falling now, and where it will fall next: radar rainfall estimation and deep-learning nowcasts.",
      long: [
        "Extreme rainfall from monsoon cloudbursts and severe thunderstorms can turn into flash floods within minutes to hours. Warning people in time depends on knowing two things: how hard it is raining right now, and where the heaviest rain will fall next.",
        "Weather radar measures reflectivity (dBZ), not rainfall. Relations such as Marshall–Palmer (Z = 200 R¹·⁶) translate it into rain intensity, and a few dBZ more can mean many times more rain. Getting this conversion right is the goal of quantitative precipitation estimation (QPE), and it matters most in the extremes. Dual-polarization variables and data-driven methods make these estimates far more accurate, especially for monsoon and orographic rain.",
        "Radar nowcasting extends this into the next few minutes to hours, the window where numerical models struggle most. Deep-learning models such as U-Nets and ConvLSTMs learn storm motion, growth and decay from the last few radar frames and predict the next ones. The open challenges are forecasts that blur and weaken with lead time, storms that form or decay, and keeping predictions physically consistent."
      ],
      points: ["Extreme rainfall, flash floods and monsoon variability", "Dual-pol QPE and Z–R relationships over complex terrain", "Sequence-to-sequence deep learning (ConvLSTM, U-Net) on radar frames", "Physics-informed and generative nowcasts that stay sharp at longer lead times", "Blending nowcasts with NWP for longer horizons"] }
  ],

  service: [
    { role: "Chair", org: "IEEE GRSS Student Branch Chapter, IIT Indore", date: "2025 – 26" },
    { role: "Secretary", org: "IEEE GRSS Chapter, Madhya Pradesh Section", date: "2023 – 25" },
    { role: "Webmaster & Media Ambassador", org: "IEEE GRSS Student Branch Chapter, IIT Indore", date: "2022 – 25" },
    { role: "Core Member", org: "Robotics Club, Deen Dayal Upadhyaya College, University of Delhi", date: "2018 – 19" }
  ],

  // logo: file in assets/orgs ("" shows the short name instead); dark: logo is white, so it sits on a dark tile
  memberships: [
    { name: "International Union of Radio Science (URSI) — Senior Member", logo: "assets/orgs/ursi-white.png", dark: true },
    { name: "IEEE Geoscience and Remote Sensing Society (GRSS)", logo: "assets/orgs/grss.png" },
    { name: "IEEE Antennas and Propagation Society (AP-S)", logo: "assets/orgs/aps.png" },
    { name: "IEEE Aerospace and Electronic Systems Society (AESS)", logo: "assets/orgs/aess.svg" },
    { name: "IEEE Microwave Theory and Technology Society (MTT-S)", logo: "assets/orgs/mtts.png" },
    { name: "European Geosciences Union (EGU)", logo: "assets/orgs/egu.svg" },
    { name: "Asia Oceania Geosciences Society (AOGS)", logo: "assets/orgs/aogs.png" },
    { name: "Emirati Society of GIS and Remote Sensing (ESGRS)", logo: "assets/orgs/esgrs.png" }
  ],

  /*
    Institutions: logos and campus photos live in assets/edu/.
    Leave logo or photo as "" if you don't have one — initials / a plain card are shown instead.
    Photos from Wikimedia Commons need the credit line (CC BY-SA licence).
  */
  institutions: {
    delhi: { name: "University of Delhi", short: "DU", where: "Delhi, India", logo: "assets/edu/delhi-logo.png", photo: "assets/edu/delhi-photo.jpg",
      photoLabel: "University of Delhi", credit: "Seek1, public domain", source: "https://commons.wikimedia.org/wiki/File:Delhiuni.jpg" },
    // via: where the photo came from (defaults to Wikimedia Commons)
    khalsa: { name: "Khalsa Montessori School", short: "KMS", where: "Bulandshahr, India", logo: "", photo: "assets/edu/khalsa-photo.jpg",
      photoLabel: "Khalsa Montessori School", credit: "preprimaryschools.com", via: "",
      source: "https://preprimaryschools.com/school/khalsa-montessori-senior-secondary-school-8148/photo-gallery" },
    palakkad: { name: "IIT Palakkad", short: "IIT PKD", where: "Palakkad, India", logo: "assets/edu/palakkad-logo.jpg", photo: "assets/edu/palakkad-photo.jpg",
      credit: "Gnoeee, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:IIT_Palakkad_campus_entrance.jpg" },
    indore: { name: "IIT Indore", short: "IITI", where: "Indore, India", logo: "assets/edu/iiti-logo.png", photo: "assets/edu/indore-photo.jpg",
      credit: "Annni07, CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Gate_1A_of_Indian_Institution_of_Technology,_Indore.jpg" },
    csu: { name: "Colorado State University", short: "CSU", where: "Fort Collins, USA", logo: "assets/edu/csu-logo.png", photo: "assets/edu/csu-photo.jpg",
      credit: "Spilly816, CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:CSU_The_Oval.jpg" },
    knmi: { name: "KNMI", short: "KNMI", where: "De Bilt, Netherlands", logo: "assets/edu/knmi-logo.png", photo: "assets/edu/knmi-photo.jpg",
      credit: "Sneeuwvlakte, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:KNMI_gebouw_-_2024.jpg" },
    mcgill: { name: "McGill University", short: "McGill", where: "Montréal, Canada", logo: "assets/edu/mcgill-logo.png", photo: "assets/edu/mcgill-photo.jpg",
      credit: "D. Benjamin Miller, CC0", source: "https://commons.wikimedia.org/wiki/File:Arts_Building,_McGill_University,_Aug_31_2022.jpg" }
  },

  // Stops on the "storm track" at the top of the Education & Experience page, in order
  journey: [
    { place: "Delhi", what: "B.Sc.", year: "2017", inst: "delhi" }, { place: "Palakkad", what: "M.Sc.", year: "2020", inst: "palakkad" },
    { place: "Indore", what: "Ph.D.", year: "2022", inst: "indore" }, { place: "Fort Collins", what: "CSU visit", year: "2024", inst: "csu" },
    { place: "De Bilt", what: "KNMI visit", year: "2026", inst: "knmi" }, { place: "Montréal", what: "Postdoc", year: "2026", inst: "mcgill" }
  ],

  // type: research | teaching (education entries below are shown as "Education")
  experience: [
    { title: "Postdoctoral Researcher", org: "McGill University, Dept. of Atmospheric and Oceanic Sciences", place: "Montréal, Canada", date: "Oct 2026 – Present", inst: "mcgill", type: "research",
      text: "Research on radar meteorology and atmospheric remote sensing." },
    { title: "Translational Research Fellow (Postdoc)", org: "Indian Institute of Technology Indore", place: "Indore, India", date: "Jul 2026 – Sep 2026", inst: "indore", type: "research",
      text: "Developed operational wind-profile retrieval algorithms from single-Doppler weather radar, translating research into automated, ML-enabled research-to-operations (R2O) tools for high-resolution wind monitoring." },
    { title: "Visiting Scientist", org: "Royal Netherlands Meteorological Institute (KNMI)", place: "De Bilt, Netherlands", date: "Jan 2026 – Mar 2026", inst: "knmi", type: "research",
      text: "With Dr. Ad Stoffelen: characterised rain-induced contamination in Ku-band Oceansat-3 winds and developed improved rain-flagging and wind-speed correction techniques." },
    { title: "Visiting Research Scholar", org: "Colorado State University, Dept. of Electrical & Computer Engineering", place: "Fort Collins, USA", date: "Jul 2024 – Sep 2024", inst: "csu", type: "research",
      text: "With Prof. V. Chandrasekar: 3D wind-field retrieval using Doppler weather radars." },
    { title: "Teaching Assistant", org: "IIT Indore, Dept. of Astronomy, Astrophysics & Space Engineering", place: "Indore, India", date: "Aug 2023 – Jun 2026", inst: "indore", type: "teaching",
      text: "Tutorials and labs for Remote Sensing for Atmospheric & Space Applications and Global Satellite-Based Navigation Systems." },
    { title: "Junior Teaching Assistant", org: "IIT Palakkad, Dept. of Physics", place: "Palakkad, India", date: "Sep 2021 – Jan 2022", inst: "palakkad", type: "teaching",
      text: "Tutorials and laboratory sessions for first-year B.Tech Physics-I." }
  ],

  education: [
    { title: "Ph.D., Astronomy, Astrophysics & Space Engineering", org: "Indian Institute of Technology Indore", place: "Indore, India", date: "2022 – 2026", cgpa: 10.0, inst: "indore",
      text: "Department of Astronomy, Astrophysics and Space Engineering." },
    { title: "M.Sc., Physics", org: "Indian Institute of Technology Palakkad", place: "Palakkad, India", date: "2020 – 2022", cgpa: 8.64, inst: "palakkad",
      text: "Thesis on spectral polarimetric signal processing of weather radar data, with Dr. Swaroop Sahoo." },
    { title: "B.Sc. (Hons.), Physics", org: "University of Delhi", place: "Delhi, India", date: "2017 – 2020", cgpa: 9.22, inst: "delhi", text: "" },
    { title: "Senior Secondary (Class XII)", org: "Khalsa Montessori School, Bulandshahr", place: "Bulandshahr, India", date: "2017", pct: 92.46, inst: "khalsa",
      text: "All India Senior School Certificate Examination, Central Board of Secondary Education (CBSE)." },
    { title: "Secondary (Class X)", org: "Khalsa Montessori School, Bulandshahr", place: "Bulandshahr, India", date: "2015", cgpa: 10.0, inst: "khalsa",
      text: "All India Secondary School Examination, Central Board of Secondary Education (CBSE)." }
  ],

  // type: journal | review | conference | chapter | patent
  publications: [
    { type: "journal", year: 2026, authors: "Tyagi, V., Das, S., Shukla, B. P.",
      title: "Regularized Machine Learning-Based Technique for Robust Wind Profile Retrieval from Single Doppler Weather Radar under Multicollinearity Conditions",
      venue: "IEEE Transactions on Geoscience and Remote Sensing (accepted)", doi: "10.1109/TGRS.2026.3747659" },
    { type: "journal", year: 2026, authors: "Tyagi, V., Das, S.",
      title: "A Machine Learning based Framework for Bias Correction of Doppler Weather Radar Observations",
      venue: "IEEE Geoscience and Remote Sensing Letters", doi: "10.1109/LGRS.2026.3667319" },
    { type: "journal", year: 2025, authors: "Tyagi, V., Das, S.",
      title: "A probabilistic algorithm for mitigating persistent ground clutter in Doppler weather radar",
      venue: "Journal of Geophysical Research: Atmospheres, 130(15)", doi: "10.1029/2025JD043478" },
    { type: "journal", year: 2025, authors: "Tyagi, V., Das, S., Shukla, B. P., Chakraborty, A., Chhari, A.",
      title: "Synergistic Use of EOS-06 Scatterometer and Doppler Weather Radar Observations for Coastal Wind Field Assessment: A Case Study",
      venue: "Journal of the Indian Society of Remote Sensing", doi: "10.1007/s12524-025-02257-1" },
    { type: "journal", year: 2025, authors: "Tyagi, V., Das, S., Das, S. K., et al.",
      title: "On double monsoon onset and its predictive signature",
      venue: "Meteorology and Atmospheric Physics, 137, 18", doi: "10.1007/s00703-025-01064-0" },
    { type: "journal", year: 2024, authors: "Singh, N., Tyagi, V., Das, S., Sahoo, U. K., Kundu, S. S.",
      title: "Python Indian Weather Radar Toolkit (pyiwr): An Open-Source Python Library for Analyzing and Visualizing Weather Radar Data",
      venue: "Journal of Computational Science, 102363", doi: "10.1016/j.jocs.2024.102363" },
    { type: "journal", year: 2026, authors: "Tyagi, V., Das, S.",
      title: "2019 Kerala Extreme Rainfall Event: Insights from Dual-Polarized Doppler Weather Radar Observations",
      venue: "", doi: "10.46620/26-0097" },

    { type: "review", year: 2026, authors: "Albert, V. A., Tyagi, V., Das, S.",
      title: "Long-Term Assessment of Rain Type Classification using Ground Radar Against Spaceborne Radar in the Northeast Orographic Region of India",
      venue: "Under revision — Atmospheric Research" },

    { type: "conference", year: 2025, authors: "Tyagi, V., Das, S.",
      title: "Integration of clutter mitigation algorithm into PYIWR framework: A Python toolkit for analyzing weather radar data",
      venue: "EGU General Assembly 2025, Vienna, Austria", doi: "10.5194/egusphere-egu25-20297" },
    { type: "conference", year: 2024, authors: "Nande, S., Tyagi, V., Das, S.",
      title: "Simulation study of wind field retrieval from Doppler weather radar based on linear SVR model",
      venue: "IEEE InGARSS 2024, NIT Goa, India", doi: "10.1109/InGARSS61818.2024.10984123" },
    { type: "conference", year: 2024, authors: "Tyagi, V., Nande, S., Das, S.",
      title: "Support vector regression (SVR) based framework for wind field retrieval with Doppler weather radar (DWR)",
      venue: "URSI-RCRS 2024, ARIES Nainital, India", doi: "10.46620/URSIRSRC24/1217BQC1027" },
    { type: "conference", year: 2024, authors: "Tyagi, V., Das, S., Shukla, B. P.",
      title: "Spatio-temporal analysis of long-term sea surface winds over the Indian summer monsoon region",
      venue: "IEEE IGARSS 2024, Athens, Greece", doi: "10.1109/IGARSS53475.2024.10641336" },
    { type: "conference", year: 2024, authors: "Singh, N., Tyagi, V., Saini, L., Das, S., Krishna, U. V. M., Deshpande, S. M., Sharma, S. K.",
      title: "Ground-based observations of an unprecedented rainfall event over Indore, India: A multi-instrument approach",
      venue: "IEEE IGARSS 2024, Athens, Greece", doi: "10.1109/IGARSS53475.2024.10642859" },
    { type: "conference", year: 2024, authors: "Das, S., Upadhyay, S., Tyagi, V., Singh, N., Chakraborty, S.",
      title: "A comparative study of Doppler weather radar and GPM over mountainous terrain in North-East India",
      venue: "URSI AT-RASC 2024, Gran Canaria, Spain", doi: "10.46620/URSIATRASC24/LWQQ2371" },
    { type: "conference", year: 2023, authors: "Tyagi, V., Das, S., Panda, S. K., Shukla, B. P.",
      title: "Investigating the role of horizontal winds in understanding extreme rainfall events: 2018 Kerala floods case study",
      venue: "IEEE InGARSS 2023, IIIT Bangalore, India", doi: "10.1109/InGARSS59135.2023.10490372" },
    { type: "conference", year: 2023, authors: "Singh, N., Tyagi, V., Das, S., Kundu, S. S., Sahoo, U. K.",
      title: "Investigation of orographic Z-R relationships for three locations in India",
      venue: "URSI GASS 2023, Sapporo, Japan", doi: "10.23919/URSIGASS57860.2023.10265609" },

    { type: "chapter", year: 2026, authors: "Tyagi, V., Thankachy, P. P., Panda, S. K., Das, S., Shukla, B. P.",
      title: "High-Resolution 3D Wind Field Estimation with Single-Doppler Weather Radar",
      venue: "Radar Meteorology and its Applications, Springer Atmospheric Sciences" },
    { type: "chapter", year: 2026, authors: "Das, S., Tyagi, V., Datta, A.",
      title: "Enhanced Weather Surveillance and Disaster Mitigation Capabilities in Central India",
      venue: "Radar Meteorology and its Applications, Springer Atmospheric Sciences" },

    { type: "patent", year: 2026, authors: "Tyagi, V., Das, S.",
      title: "A System and Method for Wind Profile Retrieval from Single Doppler Weather Radar",
      venue: "Patent filed — IIT Indore, India" }
  ],

  // Gallery photos in chronological order (oldest first); the page shows them newest first.
  // img: file in assets/gallery (thumbnail in assets/gallery/thumbs). cat: award | conference | phd | field
  gallery: [
    { img: "g01.jpg", cat: "conference", date: "2023", title: "Attended the STACE workshop" },
    { img: "g02.jpg", cat: "conference", date: "2023", title: "Oral presentation at OSICON-2023", place: "INCOIS, Hyderabad" },
    { img: "g03.jpg", cat: "phd", date: "Dec 2023", title: "Research progress presentation at the departmental seminar", place: "IIT Indore" },
    { img: "g04.jpg", cat: "conference", date: "Dec 2023", title: "Oral presentation at InGARSS 2023", place: "IIIT Bangalore" },
    { img: "g05.jpg", cat: "award", date: "2024", title: "First prize, Student Paper Competition, iRAD 2024", place: "IIT Indore" },
    { img: "g06.jpg", cat: "conference", date: "2024", title: "Oral presentation at NSSS-2024", place: "Goa University" },
    { img: "g07.jpg", cat: "field", date: "Aug 2024", title: "Field visit to the CHIVO C-band radar facility", place: "Colorado State University, USA" },
    { img: "g08.jpg", cat: "field", date: "Sep 2024", title: "Field visit to the CHIVO C-band radar facility", place: "Colorado State University, USA" },
    { img: "g09.jpg", cat: "conference", date: "Oct 2024", title: "Oral presentation at URSI RCRS 2024", place: "Graphic Era Hill University, Bhimtal" },
    { img: "g10.jpg", cat: "field", date: "Nov 2024", title: "Field campaign collecting hyperspectral data with a UAV" },
    { img: "g11.jpg", cat: "conference", date: "2025", title: "Oral presentation at iRAD 2025", place: "IIT Bombay" },
    { img: "g12.jpg", cat: "conference", date: "Apr 2025", title: "PICO presentation at the EGU General Assembly 2025", place: "Vienna, Austria" },
    { img: "g13.jpg", cat: "field", date: "Jun 2025", title: "Maintenance of the electric field mill (EFM) and lightning sensor", place: "IIT Indore" },
    { img: "g14.jpg", cat: "phd", date: "Jul 2025", title: "JRF-to-SRF conversion seminar and 3rd Continuous Evaluation of Research Progress", place: "IIT Indore" },
    { img: "g15.jpg", cat: "conference", date: "2025", title: "Oral presentation at the Sustainability Research Forum 2025", place: "IIT Indore" },
    { img: "g16.jpg", cat: "conference", date: "2025", title: "Oral presentation at AOGS 2025", place: "Marina Bay Sands, Singapore" },
    { img: "g17.jpg", cat: "conference", date: "2025", title: "Panelist, “Membership to Leadership: Advancing Your Career with GRSS”, IGARSS 2025", place: "Brisbane, Australia" },
    { img: "g18.jpg", cat: "conference", date: "2025", title: "Poster presentation at IGARSS 2025", place: "Brisbane, Australia" },
    { img: "g19.jpg", cat: "conference", date: "2025", title: "Oral presentation at INTROMET 2025", place: "IITM Pune" },
    { img: "g20.jpg", cat: "award", date: "Nov 2025", title: "Third prize, slogan-writing competition, Vigilance Awareness Week", place: "IIT Indore" },
    { img: "g21.jpg", cat: "field", date: "Jan 2026", title: "With Prof. V. Chandrasekar (CSU, USA) during his visit to the SIGMA Research Lab", place: "IIT Indore" },
    { img: "g22.jpg", cat: "award", date: "2026", title: "Best Student Paper Award, iRAD 2026", place: "Gauhati University, Guwahati" },
    { img: "g23.jpg", cat: "phd", date: "19 Mar 2026", title: "Ph.D. open seminar presentation", place: "IIT Indore" },
    { img: "g24.jpg", cat: "phd", date: "30 Mar 2026", title: "Ph.D. thesis submission", place: "IIT Indore" },
    { img: "g25.jpg", cat: "phd", date: "17 Jun 2026", title: "Ph.D. defence seminar", place: "IIT Indore" },
    { img: "g26.jpg", cat: "phd", date: "17 Jun 2026", title: "Successfully completed the Ph.D. defence", place: "IIT Indore" },
    { img: "g27.jpg", cat: "phd", date: "17 Jun 2026", title: "Group photo after the Ph.D. defence", place: "IIT Indore" },
    { img: "g28.jpg", cat: "phd", date: "27 Jun 2026", title: "Receiving the Ph.D. degree from the Director at the 14th Convocation", place: "IIT Indore" },
    { img: "g29.jpg", cat: "phd", date: "27 Jun 2026", title: "With family at the Ph.D. convocation", place: "IIT Indore" },
    { img: "g30.jpg", cat: "conference", date: "2026", title: "Oral presentation at URSI GASS 2026", place: "Kraków, Poland" },
    { img: "g31.jpg", cat: "award", date: "2026", title: "Receiving the URSI Young Scientist Award at URSI GASS 2026", place: "Kraków, Poland" }
  ],

  // featured: true shows the award before "Show all" is clicked
  awards: [
    { year: "2026", title: "URSI Young Scientist Award", detail: "URSI GASS 2026", featured: true },
    { year: "2026", title: "Institute Best Technology Award", detail: "Team project: low-cost unmanned system for profiling air pollutants and atmospheric parameters", featured: true },
    { year: "2026", title: "Best Student Paper Award", detail: "iRAD 2026 conference", featured: true },
    { year: "2025–26", title: "IEEE AP-S Fellowship", detail: "APSF Fellow", featured: true },
    { year: "2025", title: "Winner, IEEE GRSS 5th Student Grand Challenge", detail: "", featured: true },
    { year: "2025", title: "Short-Term Research Fellowship (STRF)", detail: "IIT Indore outbound program", featured: true },
    { year: "2025", title: "Third Prize, Slogan Writing Competition", detail: "Vigilance Awareness Week, IIT Indore" },
    { year: "2024", title: "Finalist, Bharatiya Antariksh Hackathon", detail: "ISRO, National Space Day" },
    { year: "2024", title: "First Prize, Student Paper Competition", detail: "iRAD 2024 conference" },
    { year: "2023", title: "First Prize, IEEE GRSS IADF Photo Contest", detail: "" },
    { year: "2023", title: "IEEE GRSS IDEA Professional Development Micro-grant", detail: "" },
    { year: "2023", title: "IEEE GRSS Travel Grant", detail: "InGARSS 2023, IIIT Bangalore" },
    { year: "2023", title: "Ocean Society of India Travel Grant", detail: "OSICON 2023, INCOIS" },
    { year: "2023", title: "CSIR-NET JRF (Physics)", detail: "All India Rank 237" },
    { year: "2022", title: "GATE Physics", detail: "GATE score 383" },
    { year: "2020", title: "IIT JAM Physics", detail: "All India Rank 1018" }
  ]
};
