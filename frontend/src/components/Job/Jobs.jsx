import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { FiSearch, FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";

const CATEGORIES = [
  "All",
  "Graphics & Design",
  "Mobile App Development",
  "Frontend Web Development",
  "MERN Stack Development",
  "Account & Finance",
  "Artificial Intelligence",
  "Video Animation",
  "MEAN Stack Development",
  "Data Entry Operator",
];

const SkeletonCard = () => (
  <div className="card skeleton-card">
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-chip" />
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-text short" />
    <div className="skeleton skeleton-btn" />
  </div>
);

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cc_bookmarks") || "[]");
    } catch {
      return [];
    }
  });

  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getall`, {
        withCredentials: true,
      })
      .then((res) => {
        setJobs(res.data.jobs || []);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  if (!isAuthorized) {
    navigateTo("/login");
    return null;
  }

  const toggleBookmark = (jobId) => {
    setBookmarks((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      localStorage.setItem("cc_bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.city?.toLowerCase().includes(search.toLowerCase()) ||
      job.country?.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      activeCategory === "All" || job.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <section className="jobs page">
      <div className="container">
        {/* Search Bar */}
        <div className="jobs-search-wrap">
          <div className="jobs-search-box">
            <FiSearch className="jobs-search-icon" />
            <input
              type="text"
              placeholder="Search jobs by title or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="jobs-search-input"
            />
          </div>
          <span className="jobs-count">
            {loading ? "—" : `${filtered.length} job${filtered.length !== 1 ? "s" : ""} found`}
          </span>
        </div>

        {/* Category Filter Chips */}
        <div className="jobs-filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <h1>
          {activeCategory === "All" ? "All Available Jobs" : activeCategory}
        </h1>

        {/* Jobs Grid */}
        <div className="banner">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="jobs-empty">
              <p>No jobs match your search.</p>
            </div>
          ) : (
            filtered.map((job) => {
              const isBookmarked = bookmarks.includes(job._id);
              return (
                <div className="card" key={job._id}>
                  <div className="job_card_header">
                    <h3 className="job_title">{job.title}</h3>
                    <button
                      className={`bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
                      onClick={() => toggleBookmark(job._id)}
                      title={isBookmarked ? "Remove bookmark" : "Bookmark job"}
                    >
                      {isBookmarked ? <FaBookmark /> : <FiBookmark />}
                    </button>
                  </div>
                  <div className="job_card_body">
                    <span className="chip">{job.category}</span>
                    {(job.city || job.country) && (
                      <p className="location">
                        📍 {[job.city, job.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {job.description && (
                      <p className="snippet">
                        {job.description.slice(0, 130)}
                        {job.description.length > 130 ? "…" : ""}
                      </p>
                    )}
                  </div>
                  <div className="job_card_footer">
                    <Link to={`/job/${job._id}`} className="details_btn">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Saved Jobs section */}
        {bookmarks.length > 0 && !search && activeCategory === "All" && (
          <div className="saved-banner">
            <p className="saved-label">
              <FaBookmark /> {bookmarks.length} saved job{bookmarks.length !== 1 ? "s" : ""}
              <button
                className="clear-saved"
                onClick={() => {
                  setBookmarks([]);
                  localStorage.removeItem("cc_bookmarks");
                }}
              >
                Clear all
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Jobs;
