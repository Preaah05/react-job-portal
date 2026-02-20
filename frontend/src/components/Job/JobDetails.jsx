import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const navigateTo = useNavigate();

  const { isAuthorized, user } = useContext(Context);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/v1/job/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setJob(res.data.job);
      })
      .catch((error) => {
        navigateTo("/notfound");
      });
  }, []);

  if (!isAuthorized) {
    navigateTo("/login");
  }

  // format posted date into a readable string
  const postedDate = job && job.jobPostedOn ? new Date(job.jobPostedOn).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) : "";

  return (
    <section className="jobDetail page">
      <div className="container">
        <div className="job_header">
          <div>
            <h1 className="job_title">{job.title}</h1>
            <div className="job_meta">
              <span className="chip">{job.category}</span>
              <span className="muted">{job.city || job.country}</span>
              {postedDate && <span className="muted">Posted: {postedDate}</span>}
            </div>
          </div>
        </div>

        <div className="banner job_detail_card">
          <div className="job_main">
            <div className="job_field">
              <strong>Location</strong>
              <p>{job.location || `${job.city || ""}, ${job.country || ""}`}</p>
            </div>
            <div className="job_field">
              <strong>Salary</strong>
              <p>
                {job.fixedSalary
                  ? job.fixedSalary
                  : `${job.salaryFrom || "N/A"} - ${job.salaryTo || "N/A"}`}
              </p>
            </div>

            <div className="job_description">
              <h4>Job Description</h4>
              <p>{job.description}</p>
            </div>
          </div>

          <aside className="job_aside">
            <div className="apply_box">
              <p className="apply_price">
                <strong>Apply</strong>
              </p>
              {user && user.role === "Employer" ? (
                <p className="muted">Employers cannot apply</p>
              ) : (
                <Link to={`/application/${job._id}`} className="apply_btn">
                  Apply Now
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default JobDetails;
