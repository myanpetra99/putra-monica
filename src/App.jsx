import { useState, useEffect, useRef } from "react";
import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { postWeddingRSVP, getWeddingWishes, postWeddingWish } from "./api";
import { library } from "@fortawesome/fontawesome-svg-core";

import { faCompactDisc, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { createEvent } from "ics";
import { saveAs } from "file-saver";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

library.add(faSpinner);

function App() {
  const preloadImages = (imagePaths) => {
    return Promise.all(
      imagePaths.map((imagePath) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = imagePath;
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    );
  };

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attendance, setAttendance] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const messagesRef = useRef(null);
  const [direction, setDirection] = useState(1);
  const [weddingId, setWeddingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdownText, setCountdownText] = useState("");
  const [isFading, setIsFading] = useState(false);
  const date = new Date("2023-11-18T00:00:00");
  const [mainImage, setMainImage] = useState("/gallery/1.jpg");

  function toggleMusic() {
    const audio = document.getElementById("weddingMusic");
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }

  function NormalizeName(name) {
    return name
      .split(" ")
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  const handleLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsPageLoaded(true);
    }, 500);
    // Set progress to 100% when the simulated load is done
  };

  useEffect(() => {
    const imagePaths = [
      "/hero.jpg",
      "/hero2.jpg",
      "/gallery/1.jpg",
      "/gallery/2.jpg",
      "/gallery/3.jpg",
      "/gallery/4.jpg",
      "/gallery/5.jpg",
      "/gallery/6.jpg",
      "/gallery/7.jpg",
      "/church.png",
      "/house.avif",
      "/logobca.png",
      "/logomandiri.png",
      "/vite.svg",
      "/vite-black.svg",
      "/attend.png",
      "/datetime.svg",
      "/gallery.png",
      "/gift.png",
      "/letter.png",
      "/loading.gif",
    ];

    const loadAllAssets = async () => {
      try {
        await preloadImages(imagePaths);
        handleLoading();
      } catch (error) {
        console.error("Error preloading images", error);
      }
    };

    if (document.readyState === "complete") {
      loadAllAssets();
    } else {
      window.addEventListener("load", loadAllAssets);
      return () => {
        window.removeEventListener("load", loadAllAssets);
      };
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPageLoaded && progress < 95) {
        console.log("progress", progress);
        setProgress((prevProgress) => prevProgress + 5);
      }
    }, 500);

    return () => {
      clearInterval(interval); // Clear the interval on unmount
    };
  }, [isPageLoaded, progress]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const weddingId = params.get("weddingid");
    const invitationValue = params.get("invitation");
    setWeddingId(weddingId);
    if (invitationValue) {
      const normalized = NormalizeName(invitationValue);
      setName(normalized);
    }
  }, [name]);

  useEffect(() => {
    // Fetching messages when the component mounts
    async function fetchMessages() {
      try {
        const response = await getWeddingWishes(weddingId);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }

    fetchMessages();
  }, [weddingId]);

  useEffect(() => {
    const isSubmitted = localStorage.getItem("isSubmitted");
    if (isSubmitted) {
      setIsSubmitted(true);
    }
  }, []);

  const eventPemberkatan = {
    start: [2023, 11, 18, 9, 0], // 18th November 2023, 09:00 AM
    duration: { hours: 1, minutes: 0 },
    title: "Pemberkatan Putra & Monica",
    description: "Putra & Monica Wedding Event",
    location: "Gereja HKBP Resort menteng",
    geo: { lat: -6.193514473690185, lon: 106.83433600901378 },
  };

  const eventResepsi = {
    start: [2023, 11, 18, 11, 0], // 18th November 2023, 09:00 AM
    duration: { hours: 6, minutes: 0 },
    title: "ACARA ADAT & RESEPSI Putra & Monica",
    description: "Putra & Monica Wedding Event",
    location: "Gedung Ruma Gorga Mangampu Tua I",
    geo: { lat: -6.181106363949021, lon: 106.77987208387981 },
  };

  function saveTheDate(event) {
    createEvent(event, (error, value) => {
      if (error) {
        console.log("Error creating .ics file:", error);
        return;
      }
      const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "putramonica-.ics");
    });
    console.log("save the date");
  }

  useEffect(() => {
    let animationFrameId;

    const scroll = () => {
      if (!messagesRef.current) return;

      const element = messagesRef.current;
      if (element.scrollHeight - element.scrollTop === element.clientHeight) {
        // We're at the bottom, change direction
        setDirection(-1);
      } else if (element.scrollTop === 0) {
        // We're at the top, change direction
        setDirection(1);
      }

      element.scrollTop += direction;

      animationFrameId = requestAnimationFrame(scroll);
    };

    scroll(); // Initiate the scroll

    return () => cancelAnimationFrame(animationFrameId);
  }, [direction]);

  useEffect(() => {
    if (isFading) {
      const timer = setTimeout(() => {
        setIsFading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFading]);

  function redirectToMaps(latitude, longitude) {
    window.open(`http://maps.google.com/maps?q=${latitude},${longitude}`);
  }

  const thumbnails = [
    "/gallery/1.jpg",
    "/gallery/2.jpg",
    "/gallery/3.jpg",
    "/gallery/4.jpg",
    "/gallery/5.jpg",
    "/gallery/6.jpg",
    "/gallery/7.jpg",
  ];

  const changeImage = (newImageUrl) => {
    setTimeout(() => {
      setIsFading(true);
      setMainImage(newImageUrl);
    }, 500);
  };

  useEffect(() => {
    changeImage(thumbnails[currentIndex]);
  }, [currentIndex]);

  useEffect(() => {
    AOS.init({ once: true });

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % thumbnails.length);
    }, 5000);

    // Clear the interval when the component is unmounted
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleWishSubmit = async (e) => {
    e.preventDefault();

    if (name === "") {
      alert("Nama tidak boleh kosong");
      return;
    }

    if (userMessage === "") {
      alert("Pesan tidak boleh kosong");
      return;
    }

    setIsLoading(true);
    try {
      const NormalizedName = NormalizeName(name);
      await postWeddingWish(weddingId, NormalizedName, userMessage);

      // Fetch the latest messages
      const response = await getWeddingWishes(weddingId);
      setMessages(response.data);

      // Optional: Clear the input fields after posting
      setUserMessage("");
    } catch (error) {
      console.error("Failed to post message:", error);
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading2(true);

    if (name === "") {
      alert("Nama tidak boleh kosong");
      return;
    }

    if (attendance === "") {
      alert("Mohon pilih kehadiran");
      return;
    }

    try {
      const NormalizedName = NormalizeName(name);
      await postWeddingRSVP(weddingId, NormalizedName, attendance);
      setIsSubmitted(true);
      localStorage.setItem("isSubmitted", true);
      // Or any other UI feedback you prefer
    } catch (error) {
      console.error("Failed to submit RSVP:", error);
      alert("Failed to submit response. Please try again."); // Or any other UI feedback you prefer
    } finally {
      setIsLoading2(false); // Stop loading regardless of success or failure
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = date - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownText(
        `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [slide, setSlide] = useState(false);
  const [hidden, setHidden] = useState(false);
  const slideDown = () => {
    const body = document.querySelector("body");
    body.style.overflow = "scroll";
    console.log("fill name");
    setSlide(true);
    const audio = document.getElementById("weddingMusic");
    audio.play();
    setIsPlaying(true);
    setTimeout(() => {
      setHidden(true);
    }, 1000);
  };
  return !isPageLoaded ? (
    <>
      <div
        className={`loading-screen content flex-col ${
          isPageLoaded ? "fade-out" : ""
        }`}
      >
        <img src="/vite-black.svg" width={200}></img>
        <img src="/loading.gif" width={50} />
        <h1 className="text-black">Loading</h1>

        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div
        className={`cover ${slide ? "slide-down" : ""} ${
          hidden ? "hidden" : ""
        }`}
      >
        <div className="hero">
          <div>
            <h2 className="minus-top2">THE WEDDING OF</h2>
          </div>
        </div>
        <div className="hero-content">
          <img src="/vite.svg" width={100} className="minus-bot"></img>
          <h1>Putra & Monica</h1>
          <h2 className="minus-top">18 . 11 . 23</h2>
          <h3>Kepada Ibu/Bapak/Saudara/i</h3>
          <h3>{name}</h3>
          <button onClick={slideDown} className="primary-btn">
            Buka Undangan
          </button>
        </div>
      </div>
      <div className="bottom-navbar-fixed flex-row">
        <a href="#rsvp" className="btn-navbar">
          <img src="/attend.png" width={20}></img>
          <h3>RSVP</h3>
        </a>
        <a href="#EventSchedule" className="btn-navbar">
          <img src="/datetime.svg" width={20}></img>
          <h3>Wedding Event</h3>
        </a>
        <a href="#gallery" className="btn-navbar">
          <img src="/gallery.png" width={20}></img>
          <h3>See Gallery</h3>
        </a>
        <a href="#gift" className="btn-navbar">
          <img src="/gift.png" width={20}></img>
          <h3>Send &#10; &#13;Gift</h3>
        </a>
        <a href="#wish" className="btn-navbar">
          <img src="/letter.png" width={20}></img>
          <h3>Send Wish</h3>
        </a>
      </div>
      <div className="content content1 min-vh minus-top">
        <div className="quote" data-aos="fade-up" data-aos-duration="2000">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path
              stroke="white"
              d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"
            ></path>
          </svg>

          <h2>
            “So they are no longer two, but one flesh. Therefore what God has
            joined together, let no one separate.”{" "}
          </h2>
          <h2 className="text-smaller">Matthew 19:6</h2>
        </div>
        <div className="bottom flex-col">
          <h2>{countdownText}</h2>
          <button onClick={() => saveTheDate(eventResepsi)}>
            Save the Date
          </button>
          <svg width="25" height="40" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="2.5"
              y="2.5"
              rx="7.5"
              ry="7.5"
              width="20"
              height="35"
              stroke="white"
              fill="none"
              strokeWidth="1"
            />
            <line
              x1="12.5"
              y1="8.5"
              x2="12.5"
              y2="16.5"
              stroke="white"
              strokeWidth="1.5"
              className="scroll-wheel"
            />
          </svg>
          <h3>Scroll Down</h3>
        </div>
      </div>

      <div className="content about-couple" id="AboutCouple">
        <br></br>
        <div className="container">
          <div className="profile-grid">
            <div
              className="profile-detail"
              data-aos="fade-left"
              data-aos-duration="2000"
            >
              <h1>The Bride </h1>
              <h2 className="name text-black">
                Monica Yohanna br.Sembiring Meliala,S.H.
              </h2>
              <p className="details">
                <b>Putri Pertama dari:</b>
              </p>
              <p className="details">Bapak Ir. Berdikari Sembiring </p>
              <span className="details">dan</span>
              <p className="details">Ibu Selva Sara br.Ginting</p>
            </div>
            <div
              className="profile-detail"
              data-aos="fade-right"
              data-aos-duration="2000"
            >
              <h1>The Groom </h1>
              <h2 className="name text-black">
                Putra Partahi Bonardo Sitorus,S.H.
              </h2>
              <p className="details">
                <b>Putra Kedua dari:</b>
              </p>
              <p className="details">Bapak Ir. Morgan Sitorus </p>{" "}
              <span className="details">dan</span>
              <p className="details">Ibu Parasiana br.Sinurat</p>
            </div>
          </div>

          <div className="divider"></div>
        </div>
      </div>

      <div className="content wedding-schedule-container" id="EventSchedule">
        <h1 data-aos="fade-up" data-aos-duration="2000">
          Wedding Schedule
        </h1>
        {/* <div className="schedule" data-aos="fade-up" data-aos-duration="2000">
          <h1>Martumpol</h1>

          <h2>29 October 2023</h2>
          <b>Telah dilaksanakan</b>
          <h3>
            Jl. Prambanan Raya, RT.006/RW.012, Cibodas Baru, Kec. Cibodas, Kota
            Tangerang, Banten 15138, Indonesia
          </h3>
        </div> */}
        <div className="schedule" data-aos="fade-up" data-aos-duration="2000">
          <h1 className="text-black title">Pemberkatan</h1>
          <img src="/church.png" width={50}></img>

          <h2 className="text-black">18 November 2023</h2>
          <h3>09:00 - 10:00</h3>
          <h3>
            <span className="text-black">
              Gereja HKBP Menteng Resort Menteng
            </span>{" "}
            <br></br> Jl. Jambu no. 46, Menteng, Jakarta Pusat
          </h3>
          <div className="flex-col">
            <button
              className="btn-invisible"
              onClick={() => saveTheDate(eventPemberkatan)}
            >
              Simpan tanggal
            </button>
            <button
              className="btn-invisible"
              onClick={() =>
                redirectToMaps(
                  eventPemberkatan.geo.lat,
                  eventPemberkatan.geo.lon
                )
              }
            >
              Lihat lokasi
            </button>
          </div>
        </div>
        <div className="schedule" data-aos="fade-up" data-aos-duration="2000">
          <h1 className="text-black title">Resepsi</h1>
          <img src="/house.avif" width={50}></img>
          <h2 className="text-black">18 November 2023</h2>
          <h3>11:00 - selesai</h3>
          <h3>
            <span className="text-black">
              Gedung Ruma Gorga Mangampu Tua I <br></br>(Lantai 2)
            </span>{" "}
            <br></br>Jl. Patra Raya No.12, Tanjung Duren, Jakarta Barat
          </h3>
          <div className="flex-col">
            <button
              className="btn-invisible"
              onClick={() => saveTheDate(eventResepsi)}
            >
              Simpan tanggal
            </button>
            <button
              className="btn-invisible"
              onClick={() =>
                redirectToMaps(eventResepsi.geo.lat, eventResepsi.geo.lon)
              }
            >
              Lihat lokasi
            </button>
          </div>
        </div>
      </div>

      <div className="content gallery" id="gallery">
        <div>
          <h1 className="text-gray">with love </h1>
          <h2
            className="text-gray"
            data-aos="fade-down"
            data-aos-duration="2000"
          >
            capturing moments of timeless memories, heartfelt laughter, and
            shared dreams.
          </h2>
        </div>

        <div
          className="gallery-container"
          data-aos="zoom-out"
          data-aos-duration="2000"
        >
          <img
            id="mainImage"
            className={`main-image ${isFading ? "fade-out" : ""}`}
            src={mainImage}
            alt="Main Displayed Image"
          />

          {/* <div className="thumbnails">
            {thumbnails.map((thumb, index) => (
              <img
                key={index}
                src={thumb}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => changeImage(thumb)}
                className={`${
                  mainImage === thumb ? "thumbnail-active" : "thumbnail"
                } ${isFading ? "fade-out" : ""}`}
              />
            ))}
          </div> */}
        </div>
      </div>

      <div className="content confirmation-rsvp" id="rsvp">
        <div className="rsvp">
          <h2 data-aos="fade-down" data-aos-duration="2000">
            Confirmation RSVP
          </h2>
          {isSubmitted ? (
            <h2 data-aos="fade-down" data-aos-duration="2000">
              Thank you for your respond
            </h2>
          ) : (
            <div>
              <form className="rsvp-control" onSubmit={handleRsvpSubmit}>
                <input
                  placeholder="nama anda"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="flex-row input-control">
                  <input
                    type="radio"
                    id="hadirPemberkatan"
                    name="rsvp"
                    value="hadir pemberkatan"
                    checked={attendance === "hadir pemberkatan"}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                  <label htmlFor="hadirPemberkatan">Hadir Pemberkatan</label>
                </div>

                <div className="flex-row input-control">
                  <input
                    type="radio"
                    id="hadirResepsi"
                    name="rsvp"
                    value="hadir resepsi"
                    checked={attendance === "hadir resepsi"}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                  <label htmlFor="hadirResepsi">Hadir Resepsi</label>
                </div>

                <div className="flex-row input-control">
                  <input
                    type="radio"
                    id="hadirKeduanya"
                    name="rsvp"
                    value="hadir keduanya"
                    checked={attendance === "hadir keduanya"}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                  <label htmlFor="hadirKeduanya">Hadir Keduanya</label>
                </div>
                <div className="flex-row input-control">
                  <input
                    type="radio"
                    id="tidak"
                    name="rsvp"
                    value="tidak"
                    checked={attendance === "tidak"}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                  <label htmlFor="tidak">Tidak Hadir</label>
                </div>

                {isLoading2 ? (
                  <FontAwesomeIcon icon="spinner" spin />
                ) : (
                  <button
                    type="submit"
                    className="btn-invisible-black"
                    disabled={isLoading2}
                  >
                    Kirim Respon
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="content send-gift" id="gift">
        <div className="gift-description">
          <h2 data-aos="fade-up" data-aos-duration="2000">
            Tanpa mengurangi rasa hormat, bagi tamu undangan yang berkenan
            memberikan tanda kasih untuk kedua mempelai, dapat melalui amplop
            digital di bawah ini:
          </h2>
        </div>

        <div className="direct-transfer">
          <div
            className="bank flex-row"
            data-aos="fade-right"
            data-aos-duration="2000"
          >
            <img src="/logobca.png" width={100} />
            <div className="bank-detail">
              <h3>4830382637 </h3>
              <h3>a/n Monica Yohanna Sembiring</h3>
            </div>
          </div>
          <div
            className="bank flex-row"
            data-aos="fade-right"
            data-aos-duration="2000"
          >
            <img src="/logomandiri.png" width={100} />
            <div className="bank-detail">
              <h3>1180010402872 </h3>
              <h3>a/n Putra Partahi Bonardo</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="content send-wishes" id="wish">
        <h2 data-aos="zoom-out" data-aos-duration="2000" className="margin-top">
          💌 Send Your Wishes 🕊️
        </h2>

        <div className="messages" data-aos="zoom-in" data-aos-duration="2000">
          {messages != undefined && messages.length > 0 ? (
            messages.map((message, index) => (
              <div className="message" key={index}>
                <div className="message-initial">
                  <h1>{message.name[0]}</h1>
                </div>
                <div className="message-detail">
                  <h3 className="detail-name">{message.name}</h3>
                  <h3 className="detail-message">{message.message}</h3>
                </div>
                <div className="divider2"></div>
              </div>
            ))
          ) : (
            <h3
              className="text-white text-center"
              data-aos="zoom-out"
              data-aos-duration="2000"
            >
              -- Be the first to bless this lovely couple with your wishes and
              love.--
            </h3>
          )}
        </div>

        <form
          onSubmit={handleWishSubmit}
          className="form wishes-form"
          data-aos="zoom-in"
          data-aos-duration="1000"
        >
          <div className="flex-col form-control">
            <input
              type="text"
              placeholder="Nama Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              rows="5"
              placeholder="Pesan Anda"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
            {isLoading ? (
              <FontAwesomeIcon icon="spinner" spin />
            ) : (
              <button
                type="submit"
                className="btn-invisible-black"
                disabled={isLoading}
              >
                Kirim Pesan
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="content">
        <div className="music-control" onClick={toggleMusic}>
          <FontAwesomeIcon
            icon={faCompactDisc}
            className={isPlaying ? "spinning-disc" : "stop-disc"}
          />
        </div>
        <img src="/vite-black.svg" width={100} />
      </div>
      <audio id="weddingMusic" src="/music.mp3" loop />
      <div
        className={`music-icon ${
          isPlaying ? "fa-volume-up" : "fa-volume-mute"
        }`}
        onClick={toggleMusic}
      ></div>

      {/* <div className="content">
        <div id="ff-compose"></div>
      </div> */}
    </>
  );
}

export default App;
