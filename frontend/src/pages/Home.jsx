import React from "react";
import { Link } from "react-router-dom";
import { FaQuestionCircle, FaTicketAlt } from "react-icons/fa";

function Home() {
  return (
    <>
      <section className="heading">
        <h1>What do you need help with?</h1>
        <p>Please choose an option below</p>
      </section>
      <Link className="btn btn-reverse btn-block" to={"/new-ticket"}>
        <FaQuestionCircle />
        Create new ticket
      </Link>
      <Link className="btn btn-reverse btn-block" to={"/tickets"}>
        <FaTicketAlt />
        View my tickets
      </Link>
    </>
  );
}

export default Home;
