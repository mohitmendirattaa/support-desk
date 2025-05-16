import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTickets } from "../features/tickets/ticketSlice";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import TicketItem from "../components/TicketItem";
import styles from "./css/Tickets.module.css";
import clsx from "clsx";

function Tickets() {
  const { tickets } = useSelector((state) => state.tickets);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTickets());
  }, [dispatch]);

  if (!tickets) {
    return <Spinner />;
  }

  return (
    <>
      <BackButton />
      <h1>Tickets</h1>
      <div className={(clsx(styles["tickets"]), styles["container"])}>
        <div className="ticket-headings">
          <div>Priority</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Category</div>
          <div>Sub-Category</div>
          <div>Status</div>
        </div>
        {tickets.map((ticket) => {
          return <TicketItem ticket={ticket} key={ticket._id} />;
        })}
      </div>
    </>
  );
}

export default Tickets;
