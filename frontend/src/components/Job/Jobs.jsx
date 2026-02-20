import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();
  useEffect(() => {
    try {
      axios
        .get("http://localhost:4000/api/v1/job/getall", {
          withCredentials: true,
        })
        .then((res) => {
          setJobs(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  }, []);
  if (!isAuthorized) {
    navigateTo("/");
  }

  return (
    <section className="jobs page">
      <div className="container">
        <h1>ALL AVAILABLE JOBS</h1>
        <div className="banner">
          {jobs.jobs &&
            jobs.jobs.map((element) => {
              return (
                <div className="card" key={element._id}>
                  <div className="job_card_header">
                    <h3 className="job_title">{element.title}</h3>
                    <span className="chip">{element.category}</span>
                  </div>
                  <div className="job_card_body">
                    <p className="location">{element.city || element.country}</p>
                    {element.description && (
                      <p className="snippet">{element.description.slice(0, 140)}{element.description.length > 140 ? '...' : ''}</p>
                    )}
                  </div>
                  <div className="job_card_footer">
                    <Link to={`/job/${element._id}`} className="details_btn">View Details</Link>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Jobs;
