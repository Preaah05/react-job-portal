import axios from "axios";
import React, { useContext, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../main";
import { MdOutlineCloudUpload } from "react-icons/md";

const MAX_COVER = 1000;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const Application = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef();
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id } = useParams();

  const validateFile = (file) => {
    setFileError("");
    if (!file) { setResume(null); return; }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only PNG, JPEG, or WEBP allowed.");
      setResume(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError("File must be under 2 MB.");
      setResume(null);
      return;
    }
    setResume(file);
  };

  const handleFileChange = (e) => validateFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateFile(e.dataTransfer.files[0]);
  };

  const handleApplication = async (e) => {
    e.preventDefault();
    if (!resume) { toast.error("Please attach your resume image."); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("coverLetter", coverLetter);
    formData.append("resume", resume);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/post/${id}`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      setName(""); setEmail(""); setCoverLetter("");
      setPhone(""); setAddress(""); setResume(null);
      toast.success(data.message);
      navigateTo("/job/getall");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized || (user && user.role === "Employer")) {
    navigateTo("/");
    return null;
  }

  const coverLen = coverLetter.length;
  const coverClass = coverLen > MAX_COVER ? "limit" : coverLen > MAX_COVER * 0.85 ? "warn" : "";

  return (
    <section className="application">
      <div className="container">
        <h3>Application Form</h3>
        <form onSubmit={handleApplication}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Your Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Your Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          {/* Cover Letter with char counter */}
          <div>
            <textarea
              placeholder="Cover Letter… (max 1000 characters)"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              maxLength={MAX_COVER + 50}
              required
            />
            <p className={`char-counter ${coverClass}`}>
              {coverLen} / {MAX_COVER}
            </p>
          </div>

          {/* Drag-and-drop resume upload */}
          <div>
            <label>Upload Resume</label>
            <div
              className={`drop-zone ${dragOver ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="drop-icon"><MdOutlineCloudUpload /></div>
              <p>Drag & drop your resume image here</p>
              <p>PNG, JPEG, WEBP — max 2 MB</p>
              <span className="browse-btn">Browse file</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
              />
              {resume && (
                <p className="file-chosen">✓ {resume.name}</p>
              )}
              {fileError && (
                <p className="file-error">{fileError}</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Send Application"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Application;