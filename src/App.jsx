import { useState, useEffect, useRef } from "react";
import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { postWeddingRSVP, getWeddingWishes, postWeddingWish } from "./api";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

library.add(faSpinner);

function App() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attendance, setAttendance] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const messagesRef = useRef(null);
  const [direction, setDirection] = useState(1);
  const [weddingId, setWeddingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [countdownText, setCountdownText] = useState("");
  const [isFading, setIsFading] = useState(false);
  const date = new Date("2023-11-05T00:00:00");
  const [mainImage, setMainImage] = useState("src/assets/gallery1.jpeg");

  function NormalizeName(name) {
    return name
      .split(" ")
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitationValue = params.get("invitation");
    if (invitationValue) {
      setWeddingId(invitationValue);
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

  // const dummyMessages = [
  //   {
  //     name: "Guest 1",
  //     message:
  //       "💖 Wishing you both a lifetime filled with love and happiness! May your journey together be as beautiful as this day. Congratulations on finding your forever love! 💑🎉",
  //   },
  //   {
  //     name: "Guest 2",
  //     message:
  //       "🥂 Here's to a lifetime of joy, laughter, and endless love. May your love story be as magical as this wedding. Wishing you all the happiness in the world! 🌟💍",
  //   },
  //   {
  //     name: "Guest 3",
  //     message:
  //       "🎊 Cheers to the bride and groom! May your love shine forever, and may your days together be filled with warmth, laughter, and countless precious moments. Congratulations on this beautiful journey! 🥰🌹",
  //   },
  //   {
  //     name: "Guest 4",
  //     message:
  //       "🌟 Congratulations on your special day! May your love continue to grow stronger with each passing day. Here's to a beautiful future together, filled with love and blessings. 🌈💒",
  //   },
  //   {
  //     name: "Guest 5",
  //     message:
  //       "🍰 May your marriage be as sweet as your love htmlFor each other! Wishing you a lifetime of shared dreams, laughter, and unforgettable moments. 💕🎩👰",
  //   },
  //   {
  //     name: "Guest 6",
  //     message:
  //       "💐 Sending you warm wishes on this joyous occasion. May your love story be filled with chapters of love, trust, and togetherness. Congratulations, and here's to your happily ever after! 🥂💫",
  //   },
  //   {
  //     name: "Guest 7",
  //     message:
  //       "🌹 To the newlyweds, may your life together be a beautiful adventure, full of love and endless surprises. Wishing you all the best on this wonderful journey. 💑🌄",
  //   },
  //   {
  //     name: "Guest 8",
  //     message:
  //       "🎉 As you begin this new chapter in your lives, may your love story be as timeless as the stars in the sky. Congratulations, and may your days be filled with love and laughter. 🌠❤️",
  //   },
  //   {
  //     name: "Guest 9",
  //     message:
  //       "🌻 To the bride and groom, may your love continue to bloom and flourish. Your wedding day is just the beginning of a beautiful love story. Wishing you a lifetime of happiness and adventures together. 🌿💖",
  //   },
  //   {
  //     name: "Guest 10",
  //     message:
  //       "🌈 On this special day, two hearts become one. May your love burn brighter with each passing day, and may your journey together be filled with endless love and happiness. Congratulations! 🌟👩‍❤️‍👨",
  //   },
  // ];

  const thumbnails = [
    "src/assets/gallery1.jpeg",
    "src/assets/gallery2.jpeg",
    "src/assets/gallery3.jpeg",
    // Add more paths as needed
  ];

  const changeImage = (newImageUrl) => {
    setIsFading(true);
    setTimeout(() => {
      setMainImage(newImageUrl);
    }, 500);
  };

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  const handleWishSubmit = async (e) => {
    e.preventDefault();
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
    setTimeout(() => {
      setHidden(true);
    }, 1000);
  };
  return (
    <>
      <div
        className={`cover ${slide ? "slide-down" : ""} ${
          hidden ? "hidden" : ""
        }`}
      >
        <div className="hero"></div>
        <div className="hero-content">
          <h2>THE WEDDING OF</h2>
          <img src="/vite.svg" width={150}></img>
          <h1>Putra & Monica</h1>
          <h2>05.11.23</h2>
          <h2>Kepada Ibu/Bapak/Saudara/i</h2>
          <h2>{name}</h2>
          <button onClick={slideDown} className="primary-btn">
            Buka Undangan
          </button>
        </div>
      </div>
      <div className="bottom-navbar-fixed flex-row">
        <a href="#AboutCouple" className="btn-navbar">

            <img src="src/assets/couple.png" width={20}></img>
            <h3>About Couple</h3>
  
        </a>
        <a href="#EventSchedule" className="btn-navbar">

            <img src="src/assets/datetime.svg" width={20}></img>
            <h3>Wedding Event</h3>
          
        </a>
        <a href="#gallery" className="btn-navbar">

            <img src="src/assets/gallery.png" width={20}></img>
            <h3>See Gallery</h3>
          
        </a>
        <a href="#gift" className="btn-navbar">

            <img src="src/assets/gift.png" width={20}></img>
            <h3>Send &#10; &#13;Gift</h3>
  
        </a>
        <a href="#wish" className="btn-navbar">
         
            <img src="src/assets/letter.png" width={20}></img>
            <h3>Send Wish</h3>
  
        </a>
      </div>
      <div className="content content1 min-vh">
        <img src="/vite.svg" width={150}></img>
        <h1>Putra & Monica</h1>
        <div>
          <h3>We Invite You to celebrate our Wedding</h3>
          <h3>Minggu, 5 November 2023</h3>
        </div>
        <div className="bottom flex-col">
          <h2>{countdownText}</h2>
          <button>save the date</button>
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
        <div className="quote" data-aos="fade-up" data-aos-duration="2000">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              stroke="white"
              d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"
            ></path>
          </svg>
          <h3>
            Happy marriages begin when we marry the ones we love, and they
            blossom when we love the ones we marry.
          </h3>
        </div>

        <br></br>
        <div className="container">
          <div
            className="profile-grid"
            data-aos="fade-right"
            data-aos-duration="2000"
          >
            <div className="photo-frame">
              <img
                src="https://cdn-uploads.our-wedding.link/13045400-5906-11ed-8d27-1b04c8dd47e8.jpg"
                alt="photo"
              />
              <h1 className="title">The Bride</h1>
            </div>
            <div className="profile-detail">
              <h2 className="name">Putra Sitorus</h2>
              <p className="details">
                <b>Putra Ke Dua dari:</b>
              </p>
              <p className="details">Bapak Akbar S.Kom dan</p>
              <p className="details">Ibu Siti S.Pd</p>

              <div className="divider"></div>
            </div>
          </div>
        </div>
        <div className="container">
          <div
            className="profile-grid"
            data-aos="fade-left"
            data-aos-duration="2000"
          >
            <div className="profile-detail">
              <h2 className="name">Monica Yohanna Sembiring</h2>
              <p className="details">
                <b>Putri Pertama dari:</b>
              </p>
              <p className="details">Bapak Ir. Berdikari Sembiring dan</p>
              <p className="details">Ibu Selva Sara Ginting</p>

              <div className="divider"></div>
            </div>
            <div className="photo-frame">
              <img
                src="https://cdn-uploads.our-wedding.link/13045400-5906-11ed-8d27-1b04c8dd47e8.jpg"
                alt="photo"
              />
              <h1 className="title">The Groom</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="content wedding-schedule-container" id="EventSchedule">
        <h2 data-aos="fade-up" data-aos-duration="2000">
          Wedding Schedule
        </h2>
        <div className="schedule" data-aos="fade-up" data-aos-duration="2000">
          <h1>Martumpol</h1>

          <h2>29 October 2023</h2>
          <b>Telah dilaksanakan</b>
          <h3>
            Jl. Prambanan Raya, RT.006/RW.012, Cibodas Baru, Kec. Cibodas, Kota
            Tangerang, Banten 15138, Indonesia
          </h3>
        </div>
        <div className="schedule" data-aos="fade-up" data-aos-duration="2000">
          <h1>Pemberkatan</h1>

          <h2>05 November 2023</h2>
          <h3>08:00 - 09:00</h3>
          <h3>
            Jl. Prambanan Raya, RT.006/RW.012, Cibodas Baru, Kec. Cibodas, Kota
            Tangerang, Banten 15138, Indonesia
          </h3>
          <button className="btn-invisible">Lihat lokasi</button>
          <h1>Resepsi</h1>
          <h2>05 November 2023</h2>
          <h3>08:00 - 09:00</h3>
          <h3>
            Jl. Prambanan Raya, RT.006/RW.012, Cibodas Baru, Kec. Cibodas, Kota
            Tangerang, Banten 15138, Indonesia
          </h3>
          <button className="btn-invisible">Lihat lokasi</button>
        </div>
      </div>

      <div className="content gallery" id="gallery">
        <h2>
          {" "}
          "Each snapshot captured, every frame displayed, Tells the tale of
          moments our hearts have swayed. From stolen glances to deep embraces
          tight, This gallery celebrates our love’s radiant light."
        </h2>
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

          <div className="thumbnails">
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
          </div>
        </div>
      </div>

      <div className="content confirmation-rsvp">
        <div className="rsvp">
          <h2 data-aos="fade-up" data-aos-duration="2000">
            Confirmation RSVP
          </h2>
          {isSubmitted ? (
            <h2>Thank you for your respond</h2>
          ) : (
            <div>
              <input
                placeholder="nama anda"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <form className="rsvp-control" onSubmit={handleRsvpSubmit}>
                <div className="flex-row input-control">
                  <input
                    type="radio"
                    id="hadir"
                    name="rsvp"
                    value="hadir"
                    checked={attendance === "hadir"}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                  <label htmlFor="hadir">Hadir</label>
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
                <div className="flex-row input-control">
                  <input
                    type="radio"
                    id="belum"
                    name="rsvp"
                    value="belum"
                    checked={attendance === "belum"}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                  <label htmlFor="belum">Belum Pasti</label>
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
            memberikan tanda kasih untuk kedua mempelai, dapat melalui alamat di
            bawah ini:
          </h2>
        </div>

        <div className="direct-transfer">
          <div className="bank flex-row">
            <img src="src/assets/logobca.png" width={100} />
            <div className="bank-detail">
              <h3>4830382637 </h3>
              <h3>a/n Monica Yohanna Sembiring</h3>
            </div>
          </div>
          <div className="bank flex-row">
            <img src="src/assets/logomandiri.png" width={100} />
            <div className="bank-detail">
              <h3>1180010402872 </h3>
              <h3>a/n Putra Partahi Bonardo</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="content send-wishes" id="wish">
        <h2 data-aos="fade-up" data-aos-duration="2000">
          💌 Send Your Wishes 🕊️
        </h2>

        <div className="messages">
          {messages != undefined ? (
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
            <div className="messages-empty">
              <p>
                Grace the lovely couple with your heartfelt wishes. Be the first
                to shower them with your blessings and love.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleWishSubmit} className="form wishes-form">
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
        <img src="/vite-black.svg" width={100} />
      </div>

      {/* <div className="content">
        <div id="ff-compose"></div>
      </div> */}
    </>
  );
}

export default App;
