import React from "react";
import BackButton from "../components/BackButton";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaPencilAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { getTicket, closeTicket } from "../features/tickets/ticketSlice";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

function Ticket() {
  const { ticket } = useSelector((state) => state.tickets);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ticketId } = useParams();

  useEffect(() => {
    dispatch(getTicket(ticketId))
      .unwrap()
      .catch((error) => {
        toast.error(error);
      });
  }, [ticketId, dispatch]);

  const onTicketClose = () => {
    dispatch(closeTicket(ticketId))
      .unwrap()
      .then(() => {
        toast.success("Ticket Closed");
        navigate("/tickets");
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const handleEditClick = () => {
    console.log("edit button is been clicked", ticketId);
  };

  if (!ticket) {
    return <Spinner />;
  }
  console.log(ticket);

  return (
    <div className="ticket-page">
      <header className="ticket-header">
        <BackButton />
        <h2>
          Ticket ID: {ticket._id}
          <span className={`status status-${ticket.status}`}>
            {ticket.status}
          </span>
        </h2>
        <h3>
          Date Submitted: {new Date(ticket.createdAt).toLocaleString("en-IN")}
        </h3>
        <h3>Product: {ticket.product}</h3>
        <div className="ticket-desc">
          <h3>Description of the issue</h3>
          <p>{ticket.description}</p>
        </div>
        <h2>Notes</h2>
        <button className="btn btn-sm btn-secondary" onClick={handleEditClick}>
          <FaPencilAlt /> Edit
        </button>
      </header>

      {ticket.status !== "closed" && (
        <button className="btn btn-block btn-danger" onClick={onTicketClose}>
          Close Ticket
        </button>
      )}
    </div>
  );
}

export default Ticket;
