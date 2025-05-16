import React from "react";
import { Link } from "react-router-dom";

function TicketItem({ ticket }) {
  return (
    <div className="ticket">
      <div>{ticket.priority}</div>
      {/* <div>{new Date(ticket.createdAt).toLocaleString("en-IN")}</div> */}
      <div>{new Date(ticket.startDate).toLocaleString("en-IN")}</div>
      <div>{new Date(ticket.endDate).toLocaleString("en-IN")}</div>
      <div>{ticket.category}</div>
      <div>{ticket.module}</div>
      <div className={`status status-${ticket.status}`}>{ticket.status}</div>
      <Link className="btn btn-reverse btn-sm" to={`/ticket/${ticket._id}`}>
        View
      </Link>
    </div>
  );
}

export default TicketItem;
