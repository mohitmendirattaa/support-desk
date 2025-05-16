import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../features/tickets/ticketSlice";
import BackButton from "../components/BackButton";
import clsx from "clsx";
// import "../NewTicket.css";
import styles from "./css/NewTicket.module.css";

function NewTicket() {
  const { user } = useSelector((state) => state.auth);
  const [name] = useState(user.name);
  const [email] = useState(user.email);
  const [service, setService] = useState("Incident");
  const [category, setCategory] = useState("Digital");
  const [module, setModule] = useState("MM");
  const [priority, setPriority] = useState("High");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Calculate end date based on priority and start date
    const start = new Date(startDate);
    let daysToAdd = 0;
    switch (priority) {
      case "high":
        daysToAdd = 1;
        break;
      case "medium":
        daysToAdd = 3;
        break;
      case "low":
        daysToAdd = 7;
        break;
      default:
        daysToAdd = 7;
    }
    const futureDate = new Date(start);
    futureDate.setDate(start.getDate() + daysToAdd);
    setEndDate(futureDate.toISOString().split("T")[0]);
  }, [priority, startDate]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(
      createTicket({
        module,
        description,
        priority,
        startDate,
        endDate,
        service,
        category,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("New ticket created");
        navigate("/tickets");
      })
      .catch((error) => {
        toast.error(error);
      });
  };
  return (
    <>
      <BackButton />
      <div className={clsx(styles["ticket-container"])}>
        <div className={clsx(styles["ticket-left"])}>
          <form onSubmit={onSubmit} className={styles.newTicketFormGrid}>
            <div
              className={clsx(
                styles["ticket-information-header"],
                styles.yellowBackgroundFullWidth
              )}
            >
              TICKET INFORMATION
            </div>
            <div className={clsx(styles["form-group"])}>
              <label htmlFor="service">Service</label>
              <select
                name="service"
                id="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value={"Incident"}>Incident</option>
                <option value={"Service"}>Service</option>
              </select>
            </div>
            <div className={clsx(styles["form-group"])}>
              <label htmlFor="category">Category</label>
              <select
                name="category"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value={"Digital"}>Digital</option>
                <option value={"SAP"}>SAP</option>
              </select>
            </div>
            <div className={clsx(styles["form-group"])}>
              <label htmlFor="priority">Priority</label>
              <select
                name="priority"
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value={"High"}>High</option>
                <option value={"Medium"}>Medium</option>
                <option value={"Low"}>Low</option>
              </select>
            </div>
            <div className={clsx(styles["form-group"])}>
              <label htmlFor="module">Module</label>
              <select
                name="module"
                id="module"
                value={module}
                onChange={(e) => setModule(e.target.value)}
              >
                <option value={"MM"}>MM</option>
                <option value={"SD"}>SD</option>
                <option value={"FI"}>FI</option>
                <option value={"PP"}>PP</option>
                <option value={"PM"}>PM</option>
                <option value={"PS"}>PS</option>
                <option value={"QM"}>QM</option>
                <option value={"Other"}>Other</option>
              </select>
            </div>
            <div className={styles.dateInputGroupGrid}>
              <div className={clsx(styles["form-group"])}>
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  className={clsx(styles["form-control"])}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className={clsx(styles["form-group"])}>
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  className={clsx(styles["form-control"])}
                  value={endDate}
                  readOnly
                  disabled
                />
              </div>
            </div>
            <div
              className={clsx(
                styles["form-header"],
                styles["ticket-information-header"],
                styles.yellowBackgroundFullWidth
              )} // Added yellowBackgroundFullWidth
            >
              DESCRIPTION
            </div>
            <div
              className={clsx(styles["form-group"], styles.fullWidth)} // Added fullWidth
            >
              <label htmlFor="description"></label>
              <textarea
                name="description"
                id="description"
                className={clsx(styles["form-control"])}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>
            <div className={clsx(styles["form-control"], styles.fullWidth)}>
              <button className={clsx(styles["btn"], styles["btn-block"])}>
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className={clsx(styles["ticket-right"])}>
          <div className={clsx(styles["user-header"])}>USER INFORMATION</div>
          <div className={clsx(styles["user-info"])}>
            <p>
              <strong>NAME:</strong> Mohit Mendiratta
            </p>
            <p>
              <strong>CONTACT:</strong> 987654321
            </p>
            <p>
              <strong>EMAIL:</strong> Mohit@xyz.com
            </p>
            <p>
              <strong>LOCATION:</strong> Anjar, Gujarat
            </p>
            <p>
              <strong>COMPANY:</strong> Welspun Corp Ltd
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewTicket;
